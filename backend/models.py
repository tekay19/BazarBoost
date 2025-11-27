from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128, description="Password must be at least 8 characters")
    verification_code: str = Field(min_length=6, max_length=6, description="6-digit verification code")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SendVerificationCodeRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, description="6-digit verification code")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    plan: str
    credits: Optional[int] = None
    created_at: Optional[datetime] = None


class CreditBalance(BaseModel):
    balance: int


class CreditAddRequest(BaseModel):
    user_id: str
    amount: int


class SEOOptimizeRequest(BaseModel):
    title: str
    description: Optional[str] = None


class SEOOptimizeResponse(BaseModel):
    optimized_title: str
    optimized_description: str
    keywords: List[str]
    seo_score: int


class PaymentCreateRequest(BaseModel):
    package_id: int


class PaymentCreateResponse(BaseModel):
    checkout_url: str
    payment_id: str
    provider: str
    amount: int
    credits: int


class UserWithCredits(BaseModel):
    id: str
    email: EmailStr
    plan: str
    credits: int
    created_at: Optional[datetime] = None


class UsersListResponse(BaseModel):
    users: List[UserWithCredits]
