from functools import lru_cache

from pydantic_settings import BaseSettings


class ApplicationSettings(BaseSettings):
    """Runtime configuration for the HRMS Lite backend."""

    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "hrms_lite"

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_application_settings() -> ApplicationSettings:
    """Return a cached instance of the application settings."""
    return ApplicationSettings()
