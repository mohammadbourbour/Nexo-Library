from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from slowapi import Limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.db.base import Base
from app.db.session import engine
from app.routers import auth, books, category, upload


# -------------------------
# ایجاد جداول دیتابیس
# -------------------------
Base.metadata.create_all(bind=engine)

# -------------------------
# پیکربندی اصلی اپلیکیشن
# -------------------------
app = FastAPI(
    title="Sadralib Backend",
    description="API مدیریت کتابخانه الکترونیک دانشگاه صدرالمتألهین",
    version="1.0.0",
)


# -------------------------
# Middleware: Security Headers
# -------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self'; style-src 'self';"
        )
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
        return response


app.add_middleware(SecurityHeadersMiddleware)


# -------------------------
# Middleware: CORS
# -------------------------
origins = [
    "http://localhost:8080",
    "http://localhost:5173",
    "https://sadralib.ir",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Middleware: Rate Limiter (SlowAPI)
# -------------------------
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests, please slow down."},
    )


# -------------------------
# Routers
# -------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(books.router, prefix="/api/books", tags=["Books"])
app.include_router(category.router, prefix="/api/categories", tags=["Categories"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])

# سرو فایل‌های استاتیک
app.mount("/static", StaticFiles(directory="static"), name="static")


# -------------------------
# مسیر پیش‌فرض
# -------------------------
@app.get("/")
def root():
    return {"message": "Sadralib Backend is running!"}


# -------------------------
# نمایش مسیرهای فعال در زمان اجرا
# -------------------------
@app.on_event("startup")
def show_routes():
    routes = [route.path for route in app.routes]
    print("\nActive Routes:")
    for path in routes:
        print(" •", path)
    print("\n")


