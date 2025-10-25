# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# ساخت engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # لاگ SQL برای توسعه
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
