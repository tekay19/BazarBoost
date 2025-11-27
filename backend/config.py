import os
from datetime import timedelta

# Central configuration pulled from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")

# Security: Warn if default secret key is used
if SECRET_KEY == "change-me":
    import warnings
    warnings.warn("⚠️  SECRET_KEY is using default value! Change it in production!", UserWarning)

ALGORITHM = "HS256"

# Security: Minimum password requirements
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")  # gpt-4o, gpt-4o-mini, gpt-4-turbo, etc.
ADMIN_EMAILS = {email.strip().lower() for email in os.getenv("ADMIN_EMAILS", "admin@example.com").split(",") if email.strip()}
DEFAULT_PLAN = os.getenv("DEFAULT_PLAN", "free")
DEFAULT_CREDITS = int(os.getenv("DEFAULT_CREDITS", "3"))
CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]
ACCESS_TOKEN_EXPIRE = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
REFRESH_TOKEN_EXPIRE = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)

PAYMENT_PACKAGES = {
    1: {"credits": 10, "amount": 49, "label": "Starter"},
    2: {"credits": 50, "amount": 149, "label": "Pro"},
    3: {"credits": 200, "amount": 399, "label": "Scale"},
}

# Payment provider configuration
PAYMENT_PROVIDER = os.getenv("PAYMENT_PROVIDER", "stripe")  # stripe, iyzico, paytr, etc.
PAYMENT_BASE_URL = os.getenv("PAYMENT_BASE_URL", "")  # Ödeme sağlayıcısı base URL'i
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
