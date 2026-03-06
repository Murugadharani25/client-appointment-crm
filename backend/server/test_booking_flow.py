#!/usr/bin/env python
"""
Test script to verify the complete appointment booking flow including email sending
"""
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from django.test import RequestFactory
from api.views import book_appointment
from rest_framework.test import APIRequestFactory

def test_booking_with_email():
    print('=' * 70)
    print('🧪 TESTING APPOINTMENT BOOKING WITH EMAIL')
    print('=' * 70)
    
    # Test data
    test_data = {
        'name': 'Test User',
        'phone': '9876543210',
        'email': 'murugadharanik@gmail.com',  # Use a valid email you can check
        'address': 'Test Address, City',
        'association': 'None',
        'service': 'IT Software',
        'date': '2026-02-01',
        'time': '10:30',
        'notes': 'This is a test appointment to verify email sending'
    }
    
    print('\n📋 Test Data:')
    for key, value in test_data.items():
        print(f'  {key}: {value}')
    
    print('\n' + '=' * 70)
    print('🚀 Creating Mock API Request...')
    print('=' * 70)
    
    # Create a mock POST request
    factory = APIRequestFactory()
    request = factory.post(
        '/api/book-appointment/',
        data=json.dumps(test_data),
        content_type='application/json'
    )
    
    print('✅ Mock request created')
    
    print('\n' + '=' * 70)
    print('📞 Calling book_appointment view...')
    print('=' * 70)
    
    try:
        response = book_appointment(request)
        
        print(f'\n✅ Response Status Code: {response.status_code}')
        print(f'📦 Response Data:')
        print(json.dumps(response.data, indent=2))
        
        if response.status_code == 201:
            print('\n' + '=' * 70)
            print('✅ SUCCESS: Appointment booked successfully!')
            print('=' * 70)
            print('\n📧 Email Status:')
            print('  Check the Django server logs above for email sending status')
            print('  Look for lines like:')
            print('    "📧 ATTEMPTING TO SEND EMAIL"')
            print('    "✅ SUCCESS: Email sent to..."')
            print('\n📬 Check Your Email:')
            print(f'  Recipient: {test_data["email"]}')
            print('  Subject: Appointment Confirmation - IT Software')
            print('  Check inbox and spam folder!')
            
            return True
        else:
            print('\n' + '=' * 70)
            print('❌ FAILED: Unexpected response status')
            print('=' * 70)
            return False
            
    except Exception as e:
        print('\n' + '=' * 70)
        print('❌ ERROR: Exception occurred')
        print('=' * 70)
        print(f'Error Type: {type(e).__name__}')
        print(f'Error Message: {str(e)}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print('\n\n')
    success = test_booking_with_email()
    print('\n' + '=' * 70)
    if success:
        print('🎉 TEST COMPLETED SUCCESSFULLY')
        print('=' * 70)
        print('\nNext Steps:')
        print('1. Check the email logs above for "✅ SUCCESS: Email sent"')
        print('2. Check your email inbox: murugadharanik@gmail.com')
        print('3. If no email, check the Django logs for errors')
        print('4. If logs show success but no email, check spam folder')
    else:
        print('❌ TEST FAILED')
        print('=' * 70)
        print('\nTroubleshooting:')
        print('1. Check the error messages above')
        print('2. Verify MongoDB connection is working')
        print('3. Run: python debug_email.py to test email config')
    print('\n')
    
    sys.exit(0 if success else 1)
