from django.test import TestCase

from .models import Client


class ClientSearchTests(TestCase):
    def setUp(self):
        # create a few clients with different names and phones
        Client.objects.create(
            name="Arun Kumar",
            phone="1234567890",
            email="arun@example.com",
        )
        Client.objects.create(
            name="Arun Prasad",
            phone="2345678901",
            email="arunp@example.com",
        )
        Client.objects.create(
            name="Ravi Sharma",
            phone="3456789012",
            email="ravi@example.com",
        )

    def test_search_partial_name(self):
        response = self.client.get("/api/clients/?name=arun")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertTrue(any(c["name"] == "Arun Kumar" for c in data))
        self.assertTrue(any(c["name"] == "Arun Prasad" for c in data))

    def test_search_case_insensitive(self):
        response = self.client.get("/api/clients/?name=ARUN")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)

    def test_empty_query_returns_empty_list(self):
        response = self.client.get("/api/clients/?name=")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])
