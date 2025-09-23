from pydantic_settings import BaseSettings
from pydantic import Field

class GitHubSettings(BaseSettings):
    github_app_id: str = Field(..., env="GITHUB_APP_ID")
    github_private_key: str = Field(..., env="GITHUB_PRIVATE_KEY")

    class Config:
        env_file = ".env"