from pydantic_settings import BaseSettings
from pydantic import Field

class LLMSettings(BaseSettings):
    anthropic_api_key: str | None = None
    openai_api_key: str | None = None
    together_api_key: str = Field(..., env="TOGETHER_API_KEY")
    gemini_api_key: str = Field(..., env="GEMINI_API_KEY")
    gemini_api_key2: str = Field(..., env="GEMINI_API_KEY2")
    
    class Config:
        env_file = ".env"
        extra = "ignore"