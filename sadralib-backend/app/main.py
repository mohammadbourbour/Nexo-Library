from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, books
from app.db.base import Base
from app.db.session import engine

# ایجاد جداول دیتابیس (اگر هنوز ایجاد نشده باشند)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sadralib Backend",
    description="API مدیریت کتابخانه الکترونیک دانشگاه صدرالمتألهین",
    version="1.0.0"
)

# -------------------------
# تنظیمات CORS
# -------------------------
origins = [
    "http://localhost:5173",  # فرانت‌اند لوکال
    "http://127.0.0.1:5173",
    "https://sadralib.ir"     # دامنه اصلی
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# اتصال روترها
# -------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(books.router, prefix="/api/books", tags=["books"])

# -------------------------
# روت پیش‌فرض
# -------------------------
@app.get("/")
def root():
    return {"message": "Sadralib Backend is running!"}
