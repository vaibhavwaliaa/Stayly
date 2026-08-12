"""
Stayly — FastAPI Application Entry Point
Sets up CORS, router includes, startup events, and the health endpoint.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine

# Import all models so SQLAlchemy registers them with Base.metadata
from app.models.user import User  # noqa: F401
from app.models.listing import Listing  # noqa: F401
from app.models.photo import ListingPhoto  # noqa: F401
from app.models.amenity import Amenity, listing_amenities  # noqa: F401
from app.models.booking import Booking  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.wishlist import Wishlist  # noqa: F401

from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup/shutdown lifecycle handler.
    Creates all database tables on startup, then seeds demo data.
    """
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


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
