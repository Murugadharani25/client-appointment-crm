from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

from .models import Client, Appointment
from .serializers import AppointmentSerializer
from django.utils import timezone
from datetime import timedelta
import random
import uuid

# simple in-memory store for captcha tokens
CAPTCHA_STORE = {}


# ============================================================
# ✅ 1) BOOK APPOINTMENT (Client + Appointment Create)
# ============================================================
@api_view(["POST"])
def book_appointment(request):
    """
    Frontend sends:
    {
      name, phone, email, address, association,
      service, date, time, notes
    }
    """
    print(f"\n{'='*70}")
    print(f"🎯 BOOKING APPOINTMENT - REQUEST RECEIVED")
    print(f"{'='*70}")
    
    data = request.data
    
    print(f"📦 Request Data:")
    for key, value in data.items():
        print(f"  {key}: {value}")

    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")
    address = data.get("address", "")
    association = data.get("association", "None")

    service = data.get("service")
    date = data.get("date")
    time = data.get("time")
    notes = data.get("notes", "")

    # ✅ Validation
    print(f"\n🔍 Validating data...")
    if not name or not phone or not email:
        print(f"❌ Validation failed: Missing name, phone or email")
        return Response(
            {"error": "Name, phone and email are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not service or not date or not time:
        print(f"❌ Validation failed: Missing service, date or time")
        return Response(
            {"error": "Service, date and time are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    print(f"✅ Validation passed")

    # ✅ Create or update client (based on phone)
    print(f"\n💾 Creating/updating client...")
    try:
        client, created = Client.objects.get_or_create(
            phone=phone,
            defaults={
                "name": name,
                "email": email,
                "address": address,
                "association": association,
            },
        )
        
        if created:
            print(f"✅ New client created: {name} ({phone})")
        else:
            print(f"✅ Existing client found: {name} ({phone})")
            # If client exists, update details
            client.name = name
            client.email = email
            client.address = address
            client.association = association
            client.save()
            print(f"✅ Client details updated")
    except Exception as e:
        print(f"❌ Error creating/updating client: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {"error": f"Database error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # ✅ Create appointment
    print(f"\n📅 Creating appointment...")
    try:
        appointment = Appointment.objects.create(
            client=client,
            service=service,
            date=date,
            time=time,
            notes=notes,
            status="Pending",
        )
        print(f"✅ Appointment created successfully")
        print(f"  ID: {appointment.id}")
        print(f"  Service: {appointment.service}")
        print(f"  Date: {appointment.date}")
        print(f"  Time: {appointment.time}")
    except Exception as e:
        print(f"❌ Error creating appointment: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {"error": f"Failed to create appointment: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # ✅ Send confirmation email to client
    print(f"\n{'='*60}")
    print(f"📧 ATTEMPTING TO SEND EMAIL")
    print(f"{'='*60}")
    print(f"  To: {client.email}")
    print(f"  From: {settings.DEFAULT_FROM_EMAIL}")
    print(f"  Subject: Appointment Confirmation - {appointment.service}")
    
    try:
        subject = f"Appointment Confirmation - {appointment.service}"
        message = f"""
Dear {client.name},

Your appointment has been successfully booked!

Appointment Details:
- Service: {appointment.service}
- Date: {appointment.date}
- Time: {appointment.time}

Contact Information:
- Phone: {client.phone}
- Email: {client.email}

Thank you for choosing our services. We look forward to meeting you in person

Best regards,
Vienstereoptic Team
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[client.email],
            fail_silently=False,
        )
        print(f"✅ SUCCESS: Email sent to {client.email}")
        print(f"{'='*60}\n")
    except Exception as e:
        print(f"❌ FAILED: Email error - {type(e).__name__}: {str(e)}")
        print(f"{'='*60}\n")
        import traceback
        traceback.print_exc()
        # Don't fail the appointment booking if email fails

    serializer = AppointmentSerializer(appointment, context={"request": request})
    
    print(f"\n{'='*70}")
    print(f"✅ BOOKING COMPLETED SUCCESSFULLY")
    print(f"{'='*70}\n")
    
    return Response(
        {"message": "Appointment booked successfully", "appointment": serializer.data},
        status=status.HTTP_201_CREATED,
    )


# ============================================================
# ✅ 2) GET ALL APPOINTMENTS (Admin Dashboard)
# ============================================================
@api_view(["GET"])
def get_appointments(request):
    appointments = (
        Appointment.objects.select_related("client")
        .all()
        .order_by("-created_at")
    )

    serializer = AppointmentSerializer(
        appointments, many=True, context={"request": request}
    )
    return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================
# ✅ 3) UPDATE STATUS (Admin Dashboard)
# PATCH /api/appointments/<id>/status/
# ============================================================
@api_view(["PATCH"])
def update_appointment_status(request, id):
    try:
        appointment = Appointment.objects.get(id=id)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=404)

    new_status = request.data.get("status")

    allowed_status = ["Pending", "Confirmed", "Completed", "Cancelled"]
    if new_status not in allowed_status:
        return Response({"error": "Invalid status value"}, status=400)

    appointment.status = new_status
    appointment.save()

    serializer = AppointmentSerializer(appointment, context={"request": request})
    return Response(serializer.data, status=200)


# ============================================================
# ✅ 4) UPLOAD MINUTES OF MEETING PDF (MoM)
# POST /api/appointments/<id>/upload-mom/
# ============================================================
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_mom_pdf(request, id):
    try:
        appointment = Appointment.objects.get(id=id)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=404)

    pdf_file = request.FILES.get("mom_pdf")

    if not pdf_file:
        return Response({"error": "mom_pdf file is required"}, status=400)

    if not pdf_file.name.lower().endswith(".pdf"):
        return Response({"error": "Only PDF files are allowed"}, status=400)

    appointment.mom_pdf = pdf_file
    appointment.save()

    mom_url = request.build_absolute_uri(appointment.mom_pdf.url)

    return Response(
        {"message": "MoM PDF uploaded successfully", "mom_url": mom_url},
        status=200,
    )


# ============================================================
# ✅ 5) GET CLIENT BY PHONE (Auto-fill)
# GET /api/client-by-phone/?phone=9876543210
# ============================================================
@api_view(["GET"])
def get_client_by_phone(request):
    """
    Frontend calls this to auto-fill client details when phone number is entered.
    Returns client data if exists, empty response if not found.
    """
    phone = request.GET.get("phone")

    if not phone:
        return Response(
            {"error": "Phone number is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate phone number format (10 digits)
    if not phone.isdigit() or len(phone) != 10:
        return Response(
            {"error": "Phone number must be exactly 10 digits"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        client = Client.objects.get(phone=phone)
        return Response(
            {
                "exists": True,
                "client": {
                    "name": client.name,
                    "email": client.email,
                    "address": client.address or "",
                    "association": client.association,
                }
            },
            status=status.HTTP_200_OK,
        )
    except Client.DoesNotExist:
        return Response(
            {"exists": False, "message": "New client"},
            status=status.HTTP_200_OK,
        )


# ============================================================
# ✅ 6) DASHBOARD STATISTICS (Admin Dashboard Enhancements)
# GET /api/dashboard-stats/
# ============================================================
@api_view(["GET"])
def dashboard_stats(request):
    """Returns counts and summaries used by the admin dashboard."""
    today = timezone.localdate()

    # summary counts
    total_clients = Client.objects.count()
    total_appointments = Appointment.objects.count()
    pending_count = Appointment.objects.filter(status="Pending").count()
    confirmed_count = Appointment.objects.filter(status="Confirmed").count()
    completed_count = Appointment.objects.filter(status="Completed").count()
    cancelled_count = Appointment.objects.filter(status="Cancelled").count()

    # today's appointments
    todays_qs = (
        Appointment.objects.select_related("client")
        .filter(date=today)
        .order_by("time")
    )
    todays_appointments = []
    for appt in todays_qs:
        todays_appointments.append({
            "id": appt.id,
            "time": str(appt.time),
            "client_name": appt.client.name if appt.client else "",
            "service": appt.service,
            "status": appt.status,
        })

    # upcoming appointments (next 10)
    upcoming_qs = (
        Appointment.objects.select_related("client")
        .filter(date__gt=today)
        .order_by("date", "time")[:10]
    )
    upcoming_appointments = []
    for appt in upcoming_qs:
        upcoming_appointments.append({
            "id": appt.id,
            "date": str(appt.date),
            "time": str(appt.time),
            "client_name": appt.client.name if appt.client else "",
            "service": appt.service,
            "status": appt.status,
        })

    # recent clients (last 5 created)
    recent_clients_qs = Client.objects.order_by("-id")[:5]
    recent_clients = []
    for c in recent_clients_qs:
        recent_clients.append({
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
            "association": c.association,
        })

    status_distribution = [
        {"name": "Pending", "value": pending_count, "color": "#f59e0b"},
        {"name": "Confirmed", "value": confirmed_count, "color": "#3b82f6"},
        {"name": "Completed", "value": completed_count, "color": "#10b981"},
        {"name": "Cancelled", "value": cancelled_count, "color": "#ef4444"},
    ]

    return Response(
        {
            "total_clients": total_clients,
            "total_appointments": total_appointments,
            "pending_count": pending_count,
            "confirmed_count": confirmed_count,
            "completed_count": completed_count,
            "cancelled_count": cancelled_count,
            "today_count": todays_qs.count(),
            "upcoming_count": upcoming_qs.count(),
            "todays_appointments": todays_appointments,
            "upcoming_appointments": upcoming_appointments,
            "recent_clients": recent_clients,
            "status_distribution": status_distribution,
        },
        status=status.HTTP_200_OK,
    )


# ============================================================
# ✅ 6) ADMIN LOGIN (Optional)
# POST /api/admin-login/
# ============================================================


# ============================================================
# ✅ 7) CAPTCHA GENERATOR
# GET /api/captcha/
# ============================================================
@api_view(["GET"])
def get_captcha(request):
    """Return a randomly generated alphanumeric captcha string and token."""
    # 5 character uppercase alphanumeric code
    code = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=5))
    # store the expected answer same as code
    token = str(uuid.uuid4())
    CAPTCHA_STORE[token] = code
    # send code as question for display; UI can style appropriately
    return Response({"question": code, "token": token}, status=status.HTTP_200_OK)
@api_view(["POST"])
def admin_login(request):
    """
    Frontend sends:
    {
      username, password,
      captcha_token, captcha_answer
    }
    """

    # ✅ validate captcha first
    token = request.data.get("captcha_token")
    answer = request.data.get("captcha_answer")
    if not token or not answer:
        return Response({"message": "Invalid CAPTCHA. Please try again."}, status=400)
    expected = CAPTCHA_STORE.pop(token, None)
    if expected is None or expected != str(answer).strip():
        return Response({"message": "Invalid CAPTCHA. Please try again."}, status=400)

    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"message": "Username and password required"}, status=400)

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"message": "Invalid credentials"}, status=401)

    # ✅ Only allow superuser (admin)
    if not user.is_superuser:
        return Response({"message": "You are not an admin"}, status=403)

    return Response(
        {"message": "Admin login successful", "isAdmin": True},
        status=200,
    )
