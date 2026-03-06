from django.urls import path
from .views import (
    book_appointment,
    get_appointments,
    update_appointment_status,
    upload_mom_pdf,
    get_client_by_phone,
    search_clients,   # ✅ ADD THIS
    admin_login,   # ✅ ADD THIS
    get_captcha,   # ✅ ADD THIS
    dashboard_stats,   # ✅ ADD THIS
)

urlpatterns = [
    # ✅ Booking (Client side)
    path("book-appointment/", book_appointment, name="book-appointment"),

    # ✅ Client auto-fill by phone
    path("client-by-phone/", get_client_by_phone, name="client-by-phone"),

    # ✅ Client search by name (autocomplete)
    path("clients/", search_clients, name="search-clients"),   # ✅ ADD THIS

    # ✅ Admin Login API
    path("admin-login/", admin_login, name="admin-login"),   # ✅ ADD THIS

    # ✅ CAPTCHA Generator
    path("captcha/", get_captcha, name="get-captcha"),   # ✅ ADD THIS

    # ✅ Dashboard Statistics
    path("dashboard-stats/", dashboard_stats, name="dashboard-stats"),   # ✅ ADD THIS

    # ✅ Admin Dashboard list
    path("appointments/", get_appointments, name="appointments"),

    # ✅ Update appointment status (Admin)
    path("appointments/<int:id>/status/", update_appointment_status, name="update-status"),

    # ✅ Upload Minutes of Meeting PDF (Admin)
    path("appointments/<int:id>/upload-mom/", upload_mom_pdf, name="upload-mom"),
]
