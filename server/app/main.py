from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).resolve().parent.parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

from app.database import init_db
from app.routers import reminders
from app.services.scheduler_service import reminder_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    reminder_scheduler.start()
    yield
    reminder_scheduler.stop()

app = FastAPI(
    title="Call Me Reminder API",
    description="API for managing phone call reminders",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reminders.router)

@app.get("/")
def root():
    return {"message": "Call Me Reminder API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
