# app/core/config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # یک روز
    ADMIN_SECRET: str
    ENV: str = "development"  # "production" in prod
    MAX_UPLOAD_SIZE_BYTES: int = 20 * 1024 * 1024  # 20 MB default
    UPLOAD_BASE_URL: str = "/static/uploads"
    ALLOW_INIT_ADMIN: bool = False  # فقط در dev True کن اگر لازم باشه

    class Config:
        env_file = ".env"

settings = Settings()
