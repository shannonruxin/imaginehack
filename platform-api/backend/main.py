from fastapi import FastAPI
from contextlib import asynccontextmanager
from cron import scheduler
from routers import clients, messages, projects, advisor, workers


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="ImagineHack Platform API", lifespan=lifespan)

app.include_router(clients.router)
app.include_router(messages.router)
app.include_router(projects.router)
app.include_router(advisor.router)
app.include_router(workers.router)


@app.get("/health")
def health():
    return {"ok": True}
