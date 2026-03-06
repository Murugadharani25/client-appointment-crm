from rest_framework import serializers
import re
from .models import Client, Appointment


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"

    def validate_email(self, value):
        """✅ Validate email format and check if it's required"""
        if not value:
            raise serializers.ValidationError("Email is required")

        # Check email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, value):
            raise serializers.ValidationError("Email format is invalid")

        return value


class AppointmentSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    client_phone = serializers.CharField(source="client.phone", read_only=True)
    client_email = serializers.CharField(source="client.email", read_only=True)
    client_association = serializers.CharField(source="client.association", read_only=True)

    # ✅ NEW: Return PDF URL for frontend
    mom_url = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = "__all__"

    def get_mom_url(self, obj):
        """
        ✅ This will send full PDF URL to frontend:
        http://127.0.0.1:8000/media/mom/filename.pdf
        """
        request = self.context.get("request")
        if obj.mom_pdf and request:
            return request.build_absolute_uri(obj.mom_pdf.url)
        return None

    def validate(self, data):
        """✅ Validate appointment data"""
        if not data.get("service"):
            raise serializers.ValidationError("Service is required")
        if not data.get("date"):
            raise serializers.ValidationError("Date is required")
        if not data.get("time"):
            raise serializers.ValidationError("Time is required")

        return data
