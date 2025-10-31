from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://sadra:sadra_pass@localhost:5432/sadralib"
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-to-a-strong-secret")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    UPLOAD_DIR: str = "./uploads"
    FRONTEND_URL: str = "http://localhost:8080"
    ADMIN_SECRET: str = os.getenv("ADMIN_SECRET", "change-me-to-a-strong-admin-secret")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    MAX_UPLOAD_SIZE_MB: int = 50  # 50MB max file size
    ALLOWED_UPLOAD_EXTENSIONS: list = ["pdf", "jpg", "png", "jpeg", "webp"]

    class Config:
        env_file = ".env"

settings = Settings()
