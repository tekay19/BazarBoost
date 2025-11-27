import uuid
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from supabase import Client as SupabaseClient, create_client

from . import config

# Lazy initialization of Supabase client to avoid issues during testing
_supabase_client: Optional[SupabaseClient] = None


def get_supabase() -> SupabaseClient:
    global _supabase_client
    if _supabase_client is None:
        if not config.SUPABASE_URL or not config.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _supabase_client = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_client


def _single(result: Any) -> Optional[Dict[str, Any]]:
    data = result.data if hasattr(result, "data") else None
    if not data:
        return None
    if isinstance(data, list):
        return data[0] if data else None
    return data


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    res = get_supabase().table("users").select("*").eq("email", email.lower()).limit(1).execute()
    return _single(res)


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    res = get_supabase().table("users").select("*").eq("id", user_id).limit(1).execute()
    return _single(res)


def create_user(email: str, password_hash: str, plan: str) -> Dict[str, Any]:
    payload = {
        "id": str(uuid.uuid4()),
        "email": email.lower(),
        "password_hash": password_hash,
        "plan": plan,
    }
    res = get_supabase().table("users").insert(payload).execute()
    user = _single(res)
    if not user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User creation failed")
    return user


def create_initial_credits(user_id: str, balance: int) -> Dict[str, Any]:
    payload = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "balance": balance,
    }
    res = get_supabase().table("credits").insert(payload).execute()
    credit = _single(res)
    if not credit:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Credit creation failed")
    return credit


def get_credits(user_id: str) -> int:
    res = get_supabase().table("credits").select("balance").eq("user_id", user_id).limit(1).execute()
    record = _single(res)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit account not found")
    return int(record.get("balance", 0))


def set_credits(user_id: str, balance: int) -> int:
    res = get_supabase().table("credits").update({"balance": balance}).eq("user_id", user_id).execute()
    record = _single(res)
    if not record:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to update credits")
    return int(record.get("balance", balance))


def adjust_credits(user_id: str, delta: int) -> int:
    current = get_credits(user_id)
    new_balance = current + delta
    if new_balance < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient credits")
    return set_credits(user_id, new_balance)


def log_payment(user_id: str, amount: int, credits_added: int, provider: str, status_value: str = "pending") -> Dict[str, Any]:
    payload = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": amount,
        "credits_added": credits_added,
        "provider": provider,
        "status": status_value,
    }
    res = get_supabase().table("payments").insert(payload).execute()
    record = _single(res)
    if not record:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Payment record failed")
    return record


def update_payment_status(payment_id: str, status_value: str) -> Dict[str, Any]:
    res = get_supabase().table("payments").update({"status": status_value}).eq("id", payment_id).execute()
    record = _single(res)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return record


def get_all_users() -> list[Dict[str, Any]]:
    """Get all users with their credit balances for admin panel"""
    users_res = get_supabase().table("users").select("*").execute()
    users = users_res.data if hasattr(users_res, "data") else []
    
    # Get credit balances for each user
    result = []
    for user in users:
        user_id = user.get("id")
        try:
            credits = get_credits(user_id)
        except (HTTPException, Exception):
            credits = 0
        
        result.append({
            **user,
            "credits": credits
        })
    
    return result
