# app/test_connection.py
from app.db.session import engine
from app.db.base import Base

try:
    Base.metadata.create_all(bind=engine)
    print("✅ اتصال به دیتابیس موفقیت‌آمیز و جداول ایجاد شدند (در صورت وجود)")
except Exception as e:
    print("❌ خطا در اتصال به دیتابیس:", e)
