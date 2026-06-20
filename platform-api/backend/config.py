from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    EXA_API_KEY: str
    APIFY_API_TOKEN: str
    GEMINI_API_KEY: str
    LLM_MODEL: str = "gemini-2.0-flash"
    CLASSIFIER_MODEL: str = "gemini-2.0-flash-lite"
    CONVEX_URL: str
    CONVEX_DEPLOY_KEY: str = ""
    OPENCLAW_WEBHOOK_URL: str = ""

    class Config:
        env_file = "../../.env"
        extra = "ignore"


settings = Settings()
