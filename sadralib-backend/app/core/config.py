from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://sadra:sadra_pass@localhost:5432/sadralib"
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    UPLOAD_DIR: str = "./uploads"
    FRONTEND_URL: str = "http://localhost:8080"
    ADMIN_SECRET: str
    ENV: str   # "development" or "production"
    class Config:
        env_file = ".env"

settings = Settings()
