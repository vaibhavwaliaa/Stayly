"""
Photo schemas — listing photo representations.
"""

from pydantic import BaseModel, ConfigDict, Field


class PhotoBase(BaseModel):
    """Shared photo fields."""
    url: str = Field(..., max_length=1000, examples=["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80"])
    sort_order: int = Field(default=0, ge=0, examples=[0])


class PhotoCreate(PhotoBase):
    """Fields needed when attaching photos to a listing."""
    pass


class PhotoRead(PhotoBase):
    """Photo as returned in API responses."""
    id: int
    listing_id: int

    model_config = ConfigDict(from_attributes=True)
