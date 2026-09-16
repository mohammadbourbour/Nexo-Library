from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.files import _ensure_dirs
from app.core.limiter import limiter
from app.db.base import Base
from app.db.session import engine
from app.models import models as _models  # noqa: F401 — register tables
from app.routers import admin, auth, books, category, files, progress, saved_books, upload

settings.validate_production_secrets()
Base.metadata.create_all(bind=engine)
_ensure_dirs()

docs_url = None if settings.is_production else "/docs"
redoc_url = None if settings.is_production else "/redoc"
openapi_url = None if settings.is_production else "/openapi.json"

app = FastAPI(
    title="Nexo-Library API",
    description="API مدیریت کتابخانه الکترونیک Nexo-Library",
    version="1.1.0",
    docs_url=docs_url,
    redoc_url=redoc_url,
    openapi_url=openapi_url,
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
        is_file = request.url.path.startswith("/api/files/")
        if is_file:
            # Allow the frontend origin to embed PDFs in an iframe preview.
            response.headers["X-Frame-Options"] = "SAMEORIGIN"
            response.headers["Content-Security-Policy"] = (
                f"default-src 'none'; frame-ancestors 'self' {settings.FRONTEND_URL}"
            )
        else:
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; script-src 'self'; style-src 'self';"
            )
        return response


app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests, please slow down."},
    )


app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(books.router, prefix="/api/books", tags=["Books"])
app.include_router(category.router, prefix="/api/categories", tags=["Categories"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(files.router)
app.include_router(saved_books.router)
app.include_router(progress.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "Nexo-Library API is running"}
