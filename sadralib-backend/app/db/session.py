# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# ساخت engine
# SQL logging فقط در توسعه فعال است
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # لاگ SQL فقط اگر DEBUG=True
    pool_pre_ping=True,  # اتصال سالم را بررسی کن
    pool_size=10,  # تعداد اتصالات
    max_overflow=20,  # اتصالات اضافی
)

# ساخت session local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency برای FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
