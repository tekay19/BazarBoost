from fastapi import APIRouter, Depends, HTTPException, status

from . import config, db, models, utils

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create-session", response_model=models.PaymentCreateResponse)
def create_session(payload: models.PaymentCreateRequest, current_user=Depends(utils.get_current_user)):
    package = config.PAYMENT_PACKAGES.get(payload.package_id)
    if not package:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid package")

    provider = config.PAYMENT_PROVIDER
    
    # Validate payment provider configuration
    if provider == "stripe" and not config.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe secret key not configured. Set STRIPE_SECRET_KEY environment variable."
        )
    
    if not config.PAYMENT_BASE_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment base URL not configured. Set PAYMENT_BASE_URL environment variable."
        )
    
    # Log payment to database
    payment = db.log_payment(
        user_id=current_user.get("id"),
        amount=package["amount"],
        credits_added=package["credits"],
        provider=provider,
        status_value="pending",
    )
    
    # Generate checkout URL based on provider
    if provider == "stripe":
        # Stripe Checkout Session URL format
        checkout_url = f"{config.PAYMENT_BASE_URL}/checkout?payment_id={payment['id']}&provider={provider}&amount={package['amount']}&credits={package['credits']}"
    else:
        # Generic payment provider URL format
        checkout_url = f"{config.PAYMENT_BASE_URL}/checkout?payment_id={payment['id']}&provider={provider}&amount={package['amount']}&credits={package['credits']}"

    return models.PaymentCreateResponse(
        checkout_url=checkout_url,
        payment_id=payment["id"],
        provider=provider,
        amount=package["amount"],
        credits=package["credits"],
    )
