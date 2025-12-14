from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import Field, ConfigDict

class Settings(BaseSettings):
    PORT: int = Field(...,env="PORT")
    EXPRESS_URL: str = Field(..., env="EXPRESS_URL")
    model_config = ConfigDict(
        extra="ignore",  
        env_file=".env",   
    )

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        return [self.EXPRESS_URL]


@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
