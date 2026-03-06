from django.db import models

# ============================
# CHOICES
# ============================

ASSOCIATIONS = [
    ("None", "None"),
    ("YES", "YES"),
    ("JCOM", "JCOM"),
    ("JCI", "JCI"),
    ("Rotary", "Rotary"),
    ("THUDITSSIA", "THUDITSSIA"),
    ("Builder Association", "Builder Association"),
]

SERVICES = [
    ("None", "None"),
    ("IT Software", "IT Software"),
    ("IT Hardware", "IT Hardware"),
    ("Academy", "Academy"),
    ("HRMS", "HRMS"),
    ("Event Management", "Event Management"),
    ("Industrial Solutions", "Industrial Solutions"),
]

STATUS = [
    ("Pending", "Pending"),
    ("Confirmed", "Confirmed"),
    ("Completed", "Completed"),
    ("Cancelled", "Cancelled"),
]


# ============================
# CLIENT MODEL
# ============================

class Client(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(blank=False, null=False)
    address = models.TextField(blank=True, null=True)

    association = models.CharField(
        max_length=50,
        choices=ASSOCIATIONS,
        default="None",
        blank=True,
    )

    def save(self, *args, **kwargs):
        # 🔒 Hard backend protection
        if not self.association or self.association in ["N/A", "NA", ""]:
            self.association = "None"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.phone})"


# ============================
# APPOINTMENT MODEL
# ============================

class Appointment(models.Model):
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="appointments",
        null=True,
        blank=True
    )

    service = models.CharField(
        max_length=50,
        choices=SERVICES,
        default="None",
    )

    date = models.DateField()
    time = models.TimeField()
    notes = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="Pending"
    )

    priority = models.CharField(max_length=20, default="Normal")
    admin_notes = models.TextField(blank=True, null=True)

    # Minutes of Meeting PDF
    mom_pdf = models.FileField(upload_to="mom/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.client:
            return f"{self.client.name} - {self.service} - {self.date}"
        return f"Appointment - {self.service} - {self.date}"
