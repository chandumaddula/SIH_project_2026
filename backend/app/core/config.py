import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Legal Metrology Compliance System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-jwt-key-legal-metrology-compliance-2026-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./legal_metrology.db"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
