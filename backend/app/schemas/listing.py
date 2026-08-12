"""
Listing schemas — the most complex schema set.
ListingRead nests photos, amenities, and a host summary.
ListingCard is a lightweight version for grid/search results.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.photo import PhotoRead
from app.schemas.amenity import AmenityRead
from app.schemas.user import HostSummary


# ─── Base ─────────────────────────────────────────────────────────────────────

class ListingBase(BaseModel):
    """Shared listing fields."""
    title: str = Field(..., min_length=1, max_length=200, examples=["Cozy Apartment in Mumbai"])
    description: str = Field(..., min_length=10, examples=["A beautiful, sunlit apartment in the heart of the city."])
    property_type: str = Field(..., examples=["apartment"])
    city: str = Field(..., min_length=1, max_length=100, examples=["Mumbai"])
    country: str = Field(..., min_length=1, max_length=100, examples=["India"])
    price_per_night: Decimal = Field(..., gt=0, decimal_places=2, examples=[3500.00])
    max_guests: int = Field(..., ge=1, examples=[4])
    bedrooms: int = Field(..., ge=0, examples=[2])
    beds: int = Field(..., ge=1, examples=[2])
    bathrooms: int = Field(..., ge=0, examples=[1])


# ─── Create ───────────────────────────────────────────────────────────────────

class ListingCreate(ListingBase):
    """
    Fields required to create a new listing.
    host_id is set server-side from the authenticated user.
    """
    lat: Optional[float] = Field(None, ge=-90, le=90, examples=[19.076])
    lng: Optional[float] = Field(None, ge=-180, le=180, examples=[72.8777])
    amenity_ids: List[int] = Field(default_factory=list, examples=[[1, 2, 3]])
    photo_urls: List[str] = Field(..., min_length=1, examples=[["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80"]])


# ─── Update ───────────────────────────────────────────────────────────────────

class ListingUpdate(BaseModel):
    """Full update — all fields provided for PUT-style replacement."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    property_type: Optional[str] = None
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)
    price_per_night: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    max_guests: Optional[int] = Field(None, ge=1)
    bedrooms: Optional[int] = Field(None, ge=0)
    beds: Optional[int] = Field(None, ge=1)
    bathrooms: Optional[int] = Field(None, ge=0)
    amenity_ids: Optional[List[int]] = None
    photo_urls: Optional[List[str]] = Field(None, min_length=1)


# ─── Read (Full Detail) ──────────────────────────────────────────────────────

class ListingRead(ListingBase):
    """
    Full listing detail — used on the listing detail page.
    Nests photos, amenities, and a host summary.
    """
    id: int
    host_id: int
    lat: Optional[float] = None
    lng: Optional[float] = None
    avg_rating: float
    is_active: bool
    created_at: datetime
    updated_at: datetime
    photos: List[PhotoRead] = []
    amenities: List[AmenityRead] = []
    host: Optional[HostSummary] = None
    review_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ─── Card (Grid/Search Results) ──────────────────────────────────────────────

class ListingCard(BaseModel):
    """
    Lightweight listing card for grid views and search results.
    Only includes what's needed to render a card: photo, title,
    location, price, and rating.
    """
    id: int
    title: str
    city: str
    country: str
    property_type: str
    price_per_night: Decimal
    avg_rating: float
    cover_photo_url: Optional[str] = None
    review_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ─── Paginated Response ──────────────────────────────────────────────────────

class ListingPaginatedResponse(BaseModel):
    """Paginated list of listing cards."""
    items: List[ListingCard]
    total: int
    page: int
    page_size: int
