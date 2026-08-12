"""
Amenity schemas — simple name-based resource.
"""

from pydantic import BaseModel, ConfigDict, Field


class AmenityBase(BaseModel):
    """Shared amenity fields."""
    name: str = Field(..., min_length=1, max_length=100, examples=["Wifi"])


class AmenityCreate(AmenityBase):
    """Fields needed to create an amenity."""
    pass


class AmenityRead(AmenityBase):
    """Amenity as returned in API responses."""
    id: int

    model_config = ConfigDict(from_attributes=True)
