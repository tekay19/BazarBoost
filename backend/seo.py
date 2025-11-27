import json
import re
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from openai import OpenAI

from . import config, db, models, utils

router = APIRouter(prefix="/seo", tags=["seo"])

# Initialize OpenAI client - will raise error if API key is missing
def get_openai_client() -> OpenAI:
    if not config.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY environment variable must be set")
    return OpenAI(api_key=config.OPENAI_API_KEY)


def calculate_seo_score(title: str, description: str, keywords: List[str]) -> int:
    # Title length score
    title_score = 20 if 60 <= len(title) <= 110 else int(max(0, min(20, (len(title) / 110) * 20)))

    # Keyword presence score
    body = f"{title}\n{description}".lower()
    keyword_hits = sum(body.count(k.lower()) for k in keywords)
    keyword_score = min(30, keyword_hits * 5)

    # Technical section detection
    technical_present = bool(re.search(r"(^[-*•]|\n[-*•]|\d+\. )", description, re.MULTILINE))
    technical_score = 25 if technical_present else 0

    # Readability based on sentence length
    sentences = [s.strip() for s in re.split(r"[.!?]", description) if s.strip()]
    avg_len = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
    readability_score = 25 if 8 <= avg_len <= 18 else max(0, 25 - int(abs(avg_len - 13)))

    score = title_score + keyword_score + technical_score + readability_score
    return min(100, int(score))


def generate_seo_content(title: str, description: str) -> models.SEOOptimizeResponse:
    try:
        client = get_openai_client()
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OpenAI API configuration error: {str(e)}"
        )

    system_prompt = (
        "You are an e-commerce SEO expert for Turkish marketplaces like Trendyol, Hepsiburada, Shopify. "
        "Generate an optimized title (60-110 chars), a Trendyol-ready bullet-rich description, and 8-12 keywords."
    )
    user_prompt = {
        "title": title,
        "description": description or "",
        "requirements": [
            "Follow Trendyol title rules",
            "60-110 characters for title",
            "Include CTA and technical specs in bullets",
            "Use natural Turkish marketing language",
            "Return JSON with optimized_title, optimized_description, keywords",
        ],
    }

    try:
        completion = client.chat.completions.create(
            model=config.OPENAI_MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_prompt)},
            ],
        )
        content = completion.choices[0].message.content
        payload = json.loads(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OpenAI API error: {str(e)}"
        )

    optimized_title = payload.get("optimized_title") or title
    optimized_description = payload.get("optimized_description") or description or title
    keywords = payload.get("keywords") or []
    if not isinstance(keywords, list):
        keywords = [str(keywords)]

    seo_score = calculate_seo_score(optimized_title, optimized_description, keywords)
    return models.SEOOptimizeResponse(
        optimized_title=optimized_title,
        optimized_description=optimized_description,
        keywords=keywords,
        seo_score=seo_score,
    )


@router.post("/optimize", response_model=models.SEOOptimizeResponse)
def optimize(payload: models.SEOOptimizeRequest, current_user=Depends(utils.get_current_user)):
    """Secure SEO optimization with input validation"""
    # Input sanitization and validation
    title = payload.title.strip()
    description = (payload.description or "").strip()
    
    # Length validation
    if len(title) > 500:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title too long (max 500 characters)")
    if len(description) > 5000:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Description too long (max 5000 characters)")
    
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title is required")
    
    # Check credits before processing
    try:
        current_credits = db.get_credits(current_user.get("id"))
        if current_credits < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient credits")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to check credits")
    
    # Consume credit then run optimization
    try:
        db.adjust_credits(current_user.get("id"), -1)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Credit adjustment failed")
    
    return generate_seo_content(title, description)
