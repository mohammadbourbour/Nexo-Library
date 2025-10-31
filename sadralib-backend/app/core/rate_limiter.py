# app/core/rate_limiter.py
"""
Rate Limiting Configuration
محدودسازی درخواست‌ها برای جلوگیری از حملات Brute Force
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# صرفه‌های rate limiting
limiter = Limiter(key_func=get_remote_address)

# Custom error handler برای rate limit
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """
    Handle rate limit exceeded errors
    """
    logger.warning(f"Rate limit exceeded for IP: {get_remote_address(request)}")
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": "تعداد درخواست‌های بیش از حد. لطفاً بعد از چند دقیقه دوباره تلاش کنید.",
            "retry_after": "60"
        }
    )
