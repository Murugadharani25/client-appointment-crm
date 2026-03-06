#!/usr/bin/env python
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from django.core.mail import send_mail

def test_email():
    print('🔍 Testing Email Configuration...')
    print(f'EMAIL_HOST: {settings.EMAIL_HOST}')
    print(f'EMAIL_PORT: {settings.EMAIL_PORT}')
    print(f'EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}')
    print(f'EMAIL_HOST_PASSWORD: {"*" * len(os.getenv("EMAIL_HOST_PASSWORD", ""))}')
    print(f'DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}')

    try:
        send_mail(
            'Test Email from CRM System',
            'This is a test email to verify email configuration.\n\nIf you receive this email, the email system is working correctly!',
            settings.DEFAULT_FROM_EMAIL,
            ['murugadharanik@gmail.com'],  # Test recipient
            fail_silently=False,
        )
        print('✅ Test email sent successfully!')
        print('📧 Check your email inbox (and spam folder)')
    except Exception as e:
        print(f'❌ Email failed: {str(e)}')
        print('🔧 Possible issues:')
        print('1. Gmail App Password might be incorrect')
        print('2. Gmail account might have 2FA disabled')
        print('3. Gmail might be blocking less secure apps')
        print('4. Network/firewall issues')

if __name__ == '__main__':
    test_email()
