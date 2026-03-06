#!/usr/bin/env python
import os
import sys
import django
import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from django.conf import settings
from django.core.mail import send_mail

def test_smtp_connection():
    """Test basic SMTP connection and authentication"""
    print('=' * 60)
    print('🔍 EMAIL CONFIGURATION DEBUG')
    print('=' * 60)
    
    print('\n📋 Current Email Settings:')
    print(f'  EMAIL_HOST: {settings.EMAIL_HOST}')
    print(f'  EMAIL_PORT: {settings.EMAIL_PORT}')
    print(f'  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}')
    print(f'  EMAIL_USE_SSL: {settings.EMAIL_USE_SSL}')
    print(f'  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}')
    print(f'  EMAIL_HOST_PASSWORD: {"*" * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else "NOT SET"}')
    print(f'  DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}')
    
    # Test 1: Check if host is reachable
    print('\n' + '=' * 60)
    print('Test 1: Checking if SMTP host is reachable...')
    print('=' * 60)
    try:
        socket.setdefaulttimeout(10)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((settings.EMAIL_HOST, settings.EMAIL_PORT))
        print(f'✅ Host {settings.EMAIL_HOST}:{settings.EMAIL_PORT} is reachable')
    except socket.error as e:
        print(f'❌ Cannot reach {settings.EMAIL_HOST}:{settings.EMAIL_PORT}')
        print(f'   Error: {str(e)}')
        print('   Possible causes:')
        print('   - Firewall blocking the connection')
        print('   - Incorrect host/port')
        print('   - Network connectivity issues')
        return False
    
    # Test 2: Try connecting to SMTP server
    print('\n' + '=' * 60)
    print('Test 2: Connecting to SMTP server...')
    print('=' * 60)
    try:
        if settings.EMAIL_USE_SSL:
            server = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=10)
            server.set_debuglevel(1)  # Enable debug output
            
            if settings.EMAIL_USE_TLS:
                print('  Starting TLS...')
                server.starttls()
                print('  ✅ TLS started successfully')
        
        print('  ✅ Connected to SMTP server')
        
        # Test 3: Try authentication
        print('\n' + '=' * 60)
        print('Test 3: Authenticating with SMTP server...')
        print('=' * 60)
        try:
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            print('  ✅ Authentication successful!')
            
            # Test 4: Send test email
            print('\n' + '=' * 60)
            print('Test 4: Sending test email...')
            print('=' * 60)
            
            msg = MIMEMultipart()
            msg['From'] = settings.DEFAULT_FROM_EMAIL
            msg['To'] = 'murugadharanik@gmail.com'  # Test recipient
            msg['Subject'] = 'Test Email - VConnect CRM'
            
            body = '''This is a test email from VConnect CRM System.

If you receive this email, your email configuration is working correctly!

Configuration Details:
- SMTP Host: {}
- SMTP Port: {}
- TLS Enabled: {}
- From Email: {}

Timestamp: {}
'''.format(settings.EMAIL_HOST, settings.EMAIL_PORT, settings.EMAIL_USE_TLS, 
           settings.DEFAULT_FROM_EMAIL, 
           __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            
            msg.attach(MIMEText(body, 'plain'))
            
            try:
                server.send_message(msg)
                print('  ✅ Test email sent successfully!')
                print(f'  📧 Check inbox for: murugadharanik@gmail.com')
                print('  📂 Also check spam/junk folder')
            except Exception as e:
                print(f'  ❌ Failed to send email: {str(e)}')
                print('  Possible causes:')
                print('  - SMTP server not allowing relay')
                print('  - From address not authorized')
                print('  - Recipient address blocked')
            
        except smtplib.SMTPAuthenticationError as e:
            print(f'  ❌ Authentication failed!')
            print(f'  Error: {str(e)}')
            print('  Possible causes:')
            print('  1. Incorrect email username')
            print('  2. Incorrect password')
            print('  3. Account requires app-specific password')
            print('  4. Account has 2FA enabled')
            print('  5. SMTP authentication not enabled on server')
            return False
        except Exception as e:
            print(f'  ❌ Authentication error: {str(e)}')
            return False
        
        server.quit()
        
    except smtplib.SMTPException as e:
        print(f'❌ SMTP Error: {str(e)}')
        return False
    except Exception as e:
        print(f'❌ Unexpected error: {str(e)}')
        print(f'   Error type: {type(e).__name__}')
        return False
    
    # Test 5: Django's send_mail function
    print('\n' + '=' * 60)
    print('Test 5: Testing Django send_mail function...')
    print('=' * 60)
    try:
        send_mail(
            subject='Django Test Email - VConnect CRM',
            message='This is a test email using Django send_mail function.\n\nIf you receive this, Django email configuration is working!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['murugadharanik@gmail.com'],
            fail_silently=False,
        )
        print('  ✅ Django send_mail successful!')
    except Exception as e:
        print(f'  ❌ Django send_mail failed: {str(e)}')
        return False
    
    print('\n' + '=' * 60)
    print('✅ ALL TESTS PASSED - Email system is working!')
    print('=' * 60)
    return True

if __name__ == '__main__':
    try:
        success = test_smtp_connection()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print('\n\n⚠️  Test interrupted by user')
        sys.exit(1)
    except Exception as e:
        print(f'\n\n❌ Fatal error: {str(e)}')
        import traceback
        traceback.print_exc()
        sys.exit(1)
