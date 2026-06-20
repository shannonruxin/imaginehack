from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    EXA_API_KEY: str
    APIFY_API_TOKEN: str
    OPENAI_API_KEY: str
    LLM_MODEL: str = "gpt-4o"
    CONVEX_URL: str
    CONVEX_DEPLOY_KEY: str
    OPENCLAW_WEBHOOK_URL: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
