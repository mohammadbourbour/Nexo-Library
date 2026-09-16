from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


WEAK_SECRETS = {
    "change-me",
    "change-me-to-a-strong-admin-secret",
    "replace-with-a-long-random-string",
    "replace-with-a-strong-admin-secret",
    "secret",
    "jwt-secret",
}

SAMPLE_DB_MARKERS = (
    "nexo:nexo@",
    "password=password",
    "user:password@",
)


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://nexo:nexo@localhost:5432/nexo_library"
    JWT_SECRET: str = "replace-with-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    UPLOAD_DIR: str = "./uploads"
    FRONTEND_URL: str = "http://localhost:8080"
    ADMIN_SECRET: str = "change-me-to-a-strong-admin-secret"
    ENV: str = "development"
    ALLOWED_EMAIL_DOMAIN: Optional[str] = None
    ENABLE_SIGNUP: bool = True
    MAX_PDF_SIZE_MB: int = 80
    MAX_COVER_SIZE_MB: int = 5

    model_config = SettingsConfigDict(env_file=".env")

    @property
    def is_production(self) -> bool:
        return self.ENV.lower() == "production"

    @property
    def max_pdf_bytes(self) -> int:
        return self.MAX_PDF_SIZE_MB * 1024 * 1024

    @property
    def max_cover_bytes(self) -> int:
        return self.MAX_COVER_SIZE_MB * 1024 * 1024

    def cors_origins(self) -> list[str]:
        origins = {self.FRONTEND_URL.rstrip("/")}
        if not self.is_production:
            origins.update(
                {
                    "http://localhost:8080",
                    "http://127.0.0.1:8080",
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                }
            )
        return sorted(origins)

    def validate_production_secrets(self) -> None:
        if not self.is_production:
            return
        if not self.JWT_SECRET or self.JWT_SECRET in WEAK_SECRETS or len(self.JWT_SECRET) < 32:
            raise RuntimeError(
                "JWT_SECRET is missing, too short, or still a default value. "
                "Set a strong secret before running in production."
            )
        if not self.ADMIN_SECRET or self.ADMIN_SECRET in WEAK_SECRETS or len(self.ADMIN_SECRET) < 16:
            raise RuntimeError(
                "ADMIN_SECRET is missing, too short, or still a default value. "
                "Set a strong secret before running in production."
            )
        db = self.DATABASE_URL.lower()
        if any(marker in db for marker in SAMPLE_DB_MARKERS):
            raise RuntimeError(
                "DATABASE_URL still uses a sample credential. "
                "Configure a real database password in production."
            )


settings = Settings()
