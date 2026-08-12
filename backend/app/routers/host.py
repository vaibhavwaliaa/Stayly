"""
Host Router — Host dashboard endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.listing import Listing
from app.models.user import User
from app.schemas.listing import ListingCard
from app.deps import get_current_host

router = APIRouter(prefix="/host", tags=["Host"])


class HostListingResponse(ListingCard):
    is_active: bool
    booking_count: int = 0


@router.get("/listings", response_model=List[HostListingResponse])
def get_host_listings(
    current_user: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    """Return all listings created by the current host (including inactive ones)."""
    listings = (
        db.query(Listing)
        .filter(Listing.host_id == current_user.id)
        .order_by(Listing.created_at.desc())
        .all()
    )

    results = []
    for l in listings:
        cover_url = l.photos[0].url if l.photos else None
        review_cnt = l.reviews.count()
        booking_cnt = l.bookings.count()

        item = HostListingResponse(
            id=l.id,
            title=l.title,
            city=l.city,
            country=l.country,
            property_type=l.property_type,
            price_per_night=l.price_per_night,
            avg_rating=l.avg_rating,
            cover_photo_url=cover_url,
            review_count=review_cnt,
            is_active=l.is_active,
            booking_count=booking_cnt,
        )
        results.append(item)

    return results
