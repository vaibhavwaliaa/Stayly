"""
Review schemas — for creating and reading listing reviews.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ─── Create ───────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    """What the client sends to post a review."""
    rating: int = Field(..., ge=1, le=5, examples=[5])
    comment: str = Field(..., min_length=1, max_length=2000, examples=["Amazing stay! The view was breathtaking."])
    booking_id: Optional[int] = Field(None, examples=[1])


# ─── Read ─────────────────────────────────────────────────────────────────────

class ReviewerSummary(BaseModel):
    """Lightweight reviewer info shown on review cards."""
    id: int
    name: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ReviewRead(BaseModel):
    """Review as returned in API responses."""
    id: int
    listing_id: int
    guest_id: int
    booking_id: Optional[int] = None
    rating: int
    comment: str
    created_at: datetime
    guest: Optional[ReviewerSummary] = None

    model_config = ConfigDict(from_attributes=True)


# ─── Paginated Response ──────────────────────────────────────────────────────

class ReviewPaginatedResponse(BaseModel):
    """Paginated list of reviews."""
    items: list[ReviewRead]
    total: int
    page: int
    page_size: int
