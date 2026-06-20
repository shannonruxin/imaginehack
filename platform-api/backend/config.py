from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    EXA_API_KEY: str
    APIFY_API_TOKEN: str
    OPENAI_API_KEY: str
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    CLASSIFIER_MODEL: str = "gpt-4o-mini"
    CONVEX_URL: str
    CONVEX_DEPLOY_KEY: str = ""
    OPENCLAW_WEBHOOK_URL: str = ""
    BAILEYS_URL: str = "http://baileys:3001"

    class Config:
        env_file = "../../.env"
        extra = "ignore"


settings = Settings()
