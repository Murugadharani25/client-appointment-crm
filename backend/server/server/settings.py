"""
Django settings for server project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv

# ✅ Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


# ==========================
# ✅ SECURITY SETTINGS
# ==========================
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-change-this-secret-key")

DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = ["127.0.0.1", "localhost"]


# ==========================
# ✅ APPLICATIONS
# ==========================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # ✅ Third party apps
    "rest_framework",
    "corsheaders",

    # ✅ Your app
    "api",
]


# ==========================
# ✅ MIDDLEWARE
# ==========================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # MUST BE TOP
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",

    # CSRF (keep ON)
    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "server.urls"


# ==========================
# ✅ TEMPLATES
# ==========================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "server.wsgi.application"


# ==========================
# ✅ DATABASE (MongoDB Atlas using djongo)
# ==========================
DATABASES = {
    "default": {
        "ENGINE": "djongo",
        "NAME": os.getenv("MONGODB_NAME", "vconnect_db"),
        "ENFORCE_SCHEMA": False,
        "CLIENT": {
            "host": os.getenv("MONGODB_URI"),
        },
    }
}


# ==========================
# ✅ PASSWORD VALIDATION
# ==========================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ==========================
# ✅ INTERNATIONALIZATION
# ==========================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True


# ==========================
# ✅ STATIC FILES
# ==========================
STATIC_URL = "/static/"


# ==========================
# ✅ MEDIA FILES (PDF Upload)
# ==========================
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ==========================
# ✅ CORS SETTINGS (React Frontend)
# ==========================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


# ==========================
# ✅ EMAIL SETTINGS (Gmail SMTP)
# ==========================


EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "False") == "True"

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)
COMPANY_EMAIL = os.getenv("COMPANY_EMAIL", DEFAULT_FROM_EMAIL)



# ==========================
# ✅ REST FRAMEWORK SETTINGS
# ==========================
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ]
}
