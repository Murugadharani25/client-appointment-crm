from django.urls import path
from .views import (
    book_appointment,
    get_appointments,
    update_appointment_status,
    upload_mom_pdf,
    get_client_by_phone,
    get_captcha,
    dashboard_stats,
    admin_login,   # ✅ ADD THIS
)

urlpatterns = [
    # ✅ Booking (Client side)
    path("book-appointment/", book_appointment, name="book-appointment"),

    # ✅ Client auto-fill by phone
    path("client-by-phone/", get_client_by_phone, name="client-by-phone"),

    # ✅ Admin Login API
    path("admin-login/", admin_login, name="admin-login"),   # ✅ ADD THIS

    # ✅ CAPTCHA generator
    path("captcha/", get_captcha, name="get-captcha"),

    # ✅ Admin Dashboard statistics
    path("dashboard-stats/", dashboard_stats, name="dashboard-stats"),

    # ✅ Admin Dashboard list
    path("appointments/", get_appointments, name="appointments"),

    # ✅ Update appointment status (Admin)
    path("appointments/<int:id>/status/", update_appointment_status, name="update-status"),

    # ✅ Upload Minutes of Meeting PDF (Admin)
    path("appointments/<int:id>/upload-mom/", upload_mom_pdf, name="upload-mom"),
]
