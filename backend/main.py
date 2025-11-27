import logging
import os
import time
from collections import defaultdict
from pathlib import Path
from typing import Dict

from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# Load .env file from project root
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    logging.info(f"✅ Loaded .env file from {env_path}")
else:
    logging.warning(f"⚠️  .env file not found at {env_path}")

from . import auth, config, payments, seo

# Basic logging configuration for visibility in production logs
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = FastAPI(title="Marketplace SEO Backend", version="1.0.0")

# Rate limiting storage (in production, use Redis)
_rate_limit_store: Dict[str, list] = defaultdict(list)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware"""
    async def dispatch(self, request: Request, call_next):
        # Rate limiting for auth endpoints
        if request.url.path.startswith("/auth/"):
            client_ip = request.client.host if request.client else "unknown"
            endpoint = request.url.path
            
            # Clean old entries (older than 1 minute)
            current_time = time.time()
            _rate_limit_store[client_ip] = [
                ts for ts in _rate_limit_store[client_ip] 
                if current_time - ts < 60
            ]
            
            # Check rate limit (10 requests per minute per IP)
            if len(_rate_limit_store[client_ip]) >= 10:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Too many requests. Please try again later."}
                )
            
            # Add current request timestamp
            _rate_limit_store[client_ip].append(current_time)
        
        response = await call_next(request)
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers"""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


# Security middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

# CORS middleware with secure defaults
cors_origins = config.CORS_ORIGINS if config.CORS_ORIGINS != ["*"] else [
    "http://localhost:8501",  # Streamlit
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative React dev server
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["X-Request-ID"],
)

app.include_router(auth.router)
app.include_router(auth.user_router)
app.include_router(auth.admin_router)
app.include_router(seo.router)
app.include_router(payments.router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Secure validation error handler - don't expose sensitive details"""
    logging.error("Validation error: %s", exc)
    # Sanitize error messages to prevent information leakage
    sanitized_errors = []
    for error in exc.errors():
        sanitized_error = {
            "loc": error.get("loc"),
            "msg": error.get("msg"),
            "type": error.get("type")
        }
        # Remove sensitive field values
        if "input" in error:
            sanitized_error["input"] = "[REDACTED]"
        sanitized_errors.append(sanitized_error)
    return JSONResponse(status_code=422, content={"detail": sanitized_errors})


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "version": "1.0.0"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler - prevent information leakage"""
    logging.error(f"Unhandled exception: {exc}", exc_info=True)
    # Don't expose internal error details to clients
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."}
    )
