from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://nexo:nexo@localhost:5432/nexo_library"
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    UPLOAD_DIR: str = "./uploads"
    FRONTEND_URL: str = "http://localhost:8080"
    ADMIN_SECRET: str = "change-me-to-a-strong-admin-secret"
    ENV: str = "development"
    class Config:
        env_file = ".env"

settings = Settings()
