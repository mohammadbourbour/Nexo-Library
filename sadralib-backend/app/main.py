from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, books , category
from app.db.base import Base
from app.db.session import engine
from fastapi.staticfiles import StaticFiles
from app.routers import upload



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
    "http://localhost:8080",  # فرانت‌اند لوکال
    "http://127.0.0.1:8080",    # فرانت‌اند لوکال
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
app.include_router(category.router, prefix="/api/categories", tags=["categories"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.mount("/static", StaticFiles(directory="static"), name="static")
# -------------------------
# روت پیش‌فرض
# -------------------------
@app.get("/")
def root():
    return {"message": "Sadralib Backend is running!"}
print("ROUTES:", [route.path for route in app.routes])