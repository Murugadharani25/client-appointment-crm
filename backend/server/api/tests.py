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


class CaptchaAndLoginTests(TestCase):
    def test_captcha_and_login_success(self):
        # fetch captcha
        resp = self.client.get("/api/captcha/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("question", data)
        self.assertIn("token", data)

        token = data["token"]
        # question is alphanumeric code, answer equals question
        answer = data["question"]

        # create a superuser for login
        from django.contrib.auth.models import User
        User.objects.create_superuser(username="admin", password="pass123")

        # attempt login with correct captcha, credentials
        login_payload = {
            "username": "admin",
            "password": "pass123",
            "captcha_token": token,
            "captcha_answer": answer,
        }
        resp2 = self.client.post("/api/admin-login/", login_payload, content_type="application/json")
        self.assertEqual(resp2.status_code, 200)
        self.assertTrue(resp2.json().get("isAdmin"))

    def test_captcha_invalid(self):
        # obtain a captcha token but send wrong answer
        resp = self.client.get("/api/captcha/")
        token = resp.json()["token"]
        payload = {"username": "whatever", "password": "x", "captcha_token": token, "captcha_answer": "wrong"}
        resp2 = self.client.post("/api/admin-login/", payload, content_type="application/json")
        self.assertEqual(resp2.status_code, 400)
        self.assertEqual(resp2.json().get("message"), "Invalid CAPTCHA. Please try again.")

    def test_captcha_missing(self):
        payload = {"username": "u", "password": "p"}
        resp = self.client.post("/api/admin-login/", payload, content_type="application/json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid CAPTCHA", resp.json().get("message", ""))
