from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Legal Metrology Compliance System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/legal_metrology"

    JWT_SECRET_KEY: str = "super-secret-jwt-key-legal-metrology-compliance-2026-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Aliases & compatibility fields
    PROJECT_NAME: str = "Legal Metrology Compliance System"
    API_V1_STR: str = "/api/v1"

    @property
    def SECRET_KEY(self) -> str:
        return self.JWT_SECRET_KEY

    @property
    def ALGORITHM(self) -> str:
        return self.JWT_ALGORITHM

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()