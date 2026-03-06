from django.test import TestCase
from django.utils import timezone
from datetime import timedelta

from .models import Client, Appointment


class DashboardStatsTests(TestCase):
    def setUp(self):
        # create a single client and a few appointments with different statuses/dates
        self.client_obj = Client.objects.create(
            name="Alice",
            phone="1234567890",
            email="alice@example.com"
        )
        today = timezone.localdate()
        Appointment.objects.create(
            client=self.client_obj,
            service="IT Software",
            date=today,
            time="10:00",
            status="Pending",
        )
        Appointment.objects.create(
            client=self.client_obj,
            service="IT Hardware",
            date=today + timedelta(days=1),
            time="11:00",
            status="Confirmed",
        )
        Appointment.objects.create(
            client=self.client_obj,
            service="Academy",
            date=today - timedelta(days=1),
            time="12:00",
            status="Completed",
        )

    def test_dashboard_stats_response(self):
        response = self.client.get("/api/dashboard-stats/")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # basic structure
        expected_keys = [
            "total_clients",
            "total_appointments",
            "pending_count",
            "confirmed_count",
            "completed_count",
            "cancelled_count",
            "today_count",
            "upcoming_count",
            "todays_appointments",
            "upcoming_appointments",
            "recent_clients",
            "status_distribution",
        ]
        for key in expected_keys:
            self.assertIn(key, data)

        # counts should match setUp
        self.assertEqual(data["total_clients"], 1)
        self.assertEqual(data["total_appointments"], 3)
        self.assertEqual(data["pending_count"], 1)
        self.assertEqual(data["confirmed_count"], 1)
        self.assertEqual(data["completed_count"], 1)
        self.assertEqual(data["cancelled_count"], 0)
        self.assertEqual(data["today_count"], 1)
        self.assertEqual(len(data["todays_appointments"]), 1)
        self.assertEqual(len(data["upcoming_appointments"]), 1)
        self.assertEqual(len(data["recent_clients"]), 1)

        # status_distribution values should correspond
        dist = {item["name"]: item["value"] for item in data["status_distribution"]}
        self.assertEqual(dist.get("Pending"), 1)
        self.assertEqual(dist.get("Confirmed"), 1)
        self.assertEqual(dist.get("Completed"), 1)
        self.assertEqual(dist.get("Cancelled"), 0)
