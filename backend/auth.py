from fastapi import APIRouter, Depends, HTTPException, status

from . import config, db, models, utils, email_service

router = APIRouter(prefix="/auth", tags=["auth"])
user_router = APIRouter(prefix="/user", tags=["user"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/send-verification-code")
def send_verification_code(payload: models.SendVerificationCodeRequest):
    """Send 6-digit verification code to email with rate limiting"""
    email_addr = payload.email.strip().lower()
    
    # Additional email validation
    if len(email_addr) > 254:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email too long")
    
    # Check for existing user
    existing = db.get_user_by_email(email_addr)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    
    # Send verification code
    try:
        email_service.send_verification_code(email_addr)
        return {"message": "Verification code sent to email"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send verification code: {str(e)}"
        )


@router.post("/verify-code")
def verify_code(payload: models.VerifyCodeRequest):
    """Verify the verification code"""
    email_addr = payload.email.strip().lower()
    
    if email_service.verify_code(email_addr, payload.code):
        return {"verified": True, "message": "Code verified successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )


@router.post("/register", response_model=models.TokenResponse)
def register(payload: models.RegisterRequest):
    """Secure user registration with email verification"""
    # Input sanitization
    email_addr = payload.email.strip().lower()
    
    # Additional email validation
    if len(email_addr) > 254:  # RFC 5321 limit
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email too long")
    
    # Password strength check
    if len(payload.password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters")
    
    # Verify code
    if not email_service.verify_code(email_addr, payload.verification_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # Check for existing user (double check)
    existing = db.get_user_by_email(email_addr)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    
    # Create user with secure password hash
    try:
        password_hash = utils.get_password_hash(payload.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
    user = db.create_user(email_addr, password_hash, config.DEFAULT_PLAN)
    db.create_initial_credits(user["id"], config.DEFAULT_CREDITS)
    
    # Send terms and conditions email
    try:
        email_service.send_terms_and_conditions(email_addr)
    except Exception:
        # Don't fail registration if email fails
        pass
    
    # Create tokens
    token_data = {"sub": user["id"], "email": user["email"]}
    token = utils.create_access_token(token_data)
    
    return models.TokenResponse(access_token=token)


@router.post("/login", response_model=models.TokenResponse)
def login(payload: models.LoginRequest):
    """Secure login with timing attack protection"""
    # Input sanitization
    email = payload.email.strip().lower()
    
    # Always perform hash operation to prevent timing attacks
    user = db.get_user_by_email(email)
    
    # Use constant-time comparison
    if not user:
        # Still hash to prevent user enumeration via timing
        utils.get_password_hash("dummy_password")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    password_hash = user.get("password_hash", "")
    if not password_hash:
        # Still hash to prevent timing attacks
        utils.get_password_hash("dummy_password")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Verify password (this handles both bcrypt and old SHA256 hashes)
    if not utils.verify_password(payload.password, password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Create tokens
    token_data = {"sub": user["id"], "email": user["email"]}
    token = utils.create_access_token(token_data)
    
    return models.TokenResponse(access_token=token)


@router.get("/me", response_model=models.UserResponse)
def me(current_user=Depends(utils.get_current_user)):
    user_id = current_user.get("id")
    try:
        credits = db.get_credits(user_id)
    except (HTTPException, Exception):
        credits = 0
    
    return models.UserResponse(**{
        "id": user_id,
        "email": current_user.get("email"),
        "plan": current_user.get("plan", "free"),
        "credits": credits,
        "created_at": current_user.get("created_at"),
    })


@user_router.get("/credits/get", response_model=models.CreditBalance)
def get_credits(current_user=Depends(utils.get_current_user)):
    balance = db.get_credits(current_user.get("id"))
    return models.CreditBalance(balance=balance)


@user_router.post("/credits/use", response_model=models.CreditBalance)
def use_credit(current_user=Depends(utils.get_current_user)):
    balance = db.adjust_credits(current_user.get("id"), -1)
    return models.CreditBalance(balance=balance)


@user_router.post("/credits/add", response_model=models.CreditBalance)
def add_credits(payload: models.CreditAddRequest, current_user=Depends(utils.get_current_user)):
    utils.require_admin(current_user)
    target = db.get_user_by_id(payload.user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    balance = db.adjust_credits(payload.user_id, payload.amount)
    return models.CreditBalance(balance=balance)


@admin_router.get("/users", response_model=models.UsersListResponse)
def list_users(current_user=Depends(utils.get_current_user)):
    utils.require_admin(current_user)
    users_data = db.get_all_users()
    users = [
        models.UserWithCredits(
            id=u.get("id"),
            email=u.get("email"),
            plan=u.get("plan", "free"),
            credits=u.get("credits", 0),
            created_at=u.get("created_at"),
        )
        for u in users_data
    ]
    return models.UsersListResponse(users=users)


@admin_router.post("/credits", response_model=models.CreditBalance)
def admin_add_credits(payload: models.CreditAddRequest, current_user=Depends(utils.get_current_user)):
    utils.require_admin(current_user)
    target = db.get_user_by_id(payload.user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    balance = db.adjust_credits(payload.user_id, payload.amount)
    return models.CreditBalance(balance=balance)
