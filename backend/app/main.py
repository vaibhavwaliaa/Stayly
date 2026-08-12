"""
Stayly — FastAPI Application Entry Point
Sets up CORS, router includes, startup events, and the health endpoint.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup/shutdown lifecycle handler.
    Creates all database tables on startup.
    """
    # Startup: create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Stayly API",
    description="Backend API for Stayly — an Airbnb-style booking platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware — allow the frontend origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Smoke-test endpoint to confirm the server is running."""
    return {"status": "ok"}
