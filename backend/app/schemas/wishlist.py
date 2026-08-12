"""
Wishlist schemas — simple add/remove/list for saved listings.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.schemas.listing import ListingCard


class WishlistRead(BaseModel):
    """Wishlist entry with the full listing card for grid display."""
    id: int
    user_id: int
    listing_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WishlistWithListing(BaseModel):
    """Wishlist entry that includes the full listing card data."""
    id: int
    user_id: int
    listing_id: int
    created_at: datetime
    listing: ListingCard

    model_config = ConfigDict(from_attributes=True)
