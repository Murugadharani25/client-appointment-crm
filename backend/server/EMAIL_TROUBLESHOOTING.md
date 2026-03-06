# Email Troubleshooting Guide - VConnect CRM

## ✅ Current Status
Your email configuration is **WORKING CORRECTLY**! All tests passed:
- ✅ SMTP connection successful
- ✅ Authentication successful
- ✅ Test emails being sent and queued
- ✅ Django `send_mail` function working

## 🔍 If You're Not Receiving Emails

### 1. **Check Spam/Junk Folder** 📂
The most common issue! Emails from new SMTP servers often land in spam initially.

**Action**: Check the spam/junk folder for emails from `vconnect@vienstereoptic.com`

### 2. **Email Delivery Delay** ⏱️
Custom SMTP servers sometimes have delivery delays (5-15 minutes).

**Action**: Wait 10-15 minutes and check again.

### 3. **Verify Email Address** 📧
Make sure you're entering the correct email address when booking appointments.

**Action**: Double-check the email address in the booking form.

### 4. **Check Server Logs** 📋
The Django server now logs detailed email sending information.

**How to Check**:
1. Look at your PowerShell terminal where `python manage.py runserver` is running
2. After booking an appointment, you should see:
   ```
   ============================================================
   📧 ATTEMPTING TO SEND EMAIL
   ============================================================
     To: customer@example.com
     From: vconnect@vienstereoptic.com
     Subject: Appointment Confirmation - Service Name
   ✅ SUCCESS: Email sent to customer@example.com
   ============================================================
   ```

### 5. **Test Email Function** 🧪
Run the debug script to verify email system:

```powershell
cd backend/server
python debug_email.py
```

This will:
- Test SMTP connection
- Verify authentication
- Send a test email to `murugadharanik@gmail.com`
- Show detailed error messages if something fails

## 📧 Email Configuration Details

Current settings (from `.env`):
```
EMAIL_HOST=mail.vienstereoptic.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=vconnect@vienstereoptic.com
DEFAULT_FROM_EMAIL=vconnect@vienstereoptic.com
```

## 🔧 Testing Steps

### Test 1: Send Test Email
```powershell
cd backend/server
python debug_email.py
```

### Test 2: Book an Appointment
1. Go to http://localhost:3000
2. Fill out the appointment booking form
3. Use a valid email address you can check
4. Submit the form
5. Check the Django server logs for email sending status
6. Check your email inbox (and spam folder)

### Test 3: Change Test Recipient
To test with your own email, edit `debug_email.py`:
- Change line 67: `msg['To'] = 'YOUR_EMAIL@example.com'`
- Change line 120: `recipient_list=['YOUR_EMAIL@example.com']`

## ❌ Common Error Messages

### "Authentication failed"
- **Cause**: Wrong username or password
- **Fix**: Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in `.env`

### "Connection refused"
- **Cause**: Firewall blocking port 587
- **Fix**: Check firewall settings or try port 465 with SSL

### "Recipient address rejected"
- **Cause**: SMTP server not allowing relay to that domain
- **Fix**: Verify the recipient email address is valid

### "STARTTLS failed"
- **Cause**: TLS configuration issue
- **Fix**: Try setting EMAIL_USE_TLS=False and EMAIL_USE_SSL=True with port 465

## 📞 Still Having Issues?

1. Check the Django server console logs when booking an appointment
2. Run `python debug_email.py` and share the output
3. Verify the email address in the booking form is correct
4. Check your email spam folder
5. Wait 10-15 minutes for potential delivery delays

## 🎯 Expected Behavior

When an appointment is booked:
1. Django server logs should show:
   ```
   📧 ATTEMPTING TO SEND EMAIL
   ✅ SUCCESS: Email sent to customer@example.com
   ```
2. Email should arrive within 1-15 minutes
3. If email doesn't arrive, check spam folder
4. If spam folder is empty, check server logs for error messages
