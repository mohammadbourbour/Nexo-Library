from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.routers import auth, books , category
from app.db.base import Base
from app.db.session import engine
from fastapi.staticfiles import StaticFiles
from app.routers import upload
from app.core.config import settings
import logging

# تنظیم لاگینگ
logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
logger = logging.getLogger(__name__)

# ایجاد جداول دیتابیس (اگر هنوز ایجاد نشده باشند)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sadralib Backend",
    description="API مدیریت کتابخانه الکترونیک دانشگاه صدرالمتألهین",
    version="1.0.0"
)

# -------------------------
# Security Middleware
# -------------------------
# اضافه کردن Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "sadralib.ir", "*.sadralib.ir"]
)

# -------------------------
# تنظیمات CORS امن‌تر
# -------------------------
origins = [
    "http://localhost:8080",  # فرانت‌اند لوکال
    "http://127.0.0.1:8080",    # فرانت‌اند لوکال
    "https://sadralib.ir"     # دامنه اصلی
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # روشهای مشخص به جای *
    allow_headers=["Content-Type", "Authorization"],  # headersهای مشخص به جای *
)

# -------------------------
# اتصال روترها
# -------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(category.router, prefix="/api/categories", tags=["categories"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.mount("/static", StaticFiles(directory="static"), name="static")
# -------------------------
# Security Headers Middleware
# -------------------------
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    return response

# -------------------------
# روت پیش‌فرض
# -------------------------
@app.get("/")
def root():
    return {"message": "Sadralib Backend is running!", "version": "1.0.0"}

# لاگ روترها فقط در Debug Mode
if settings.DEBUG:
    logger.info("ROUTES: " + str([route.path for route in app.routes]))