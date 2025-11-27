import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from . import config, db

# OAuth2 scheme for extracting bearer tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Secure password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def get_password_hash(password: str) -> str:
    """Güvenli password hashing using bcrypt"""
    if not password:
        raise ValueError("Password cannot be empty")
    # Minimum password length check
    if len(password) < 6:
        raise ValueError("Password too short")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    if not plain_password or not hashed_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback for old SHA256 hashes during migration
        try:
            salted = f"{plain_password}{config.SECRET_KEY}"
            sha256_hash = hashlib.sha256(salted.encode()).hexdigest()
            if sha256_hash == hashed_password:
                # Migrate to bcrypt on next login
                return True
        except Exception:
            pass
        return False


def create_access_token(data: Dict[str, Any], expires_delta: timedelta = config.ACCESS_TOKEN_EXPIRE) -> str:
    """Create secure JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),  # Issued at
        "jti": secrets.token_urlsafe(16),  # JWT ID for token revocation
        "type": "access"
    })
    return jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create secure refresh token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + config.REFRESH_TOKEN_EXPIRE
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": secrets.token_urlsafe(16),
        "type": "refresh"
    })
    return jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)


def decode_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        
        # Verify token type
        if payload.get("type") != token_type:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        
        # Verify token hasn't been revoked (in production, check against blacklist)
        # For now, we'll just validate the structure
        
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def is_admin_user(user: Dict[str, Any]) -> bool:
    email = user.get("email", "").lower()
    return email in config.ADMIN_EMAILS or user.get("plan") == "admin"


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication payload")
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_admin(user: Dict[str, Any]):
    if not is_admin_user(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
