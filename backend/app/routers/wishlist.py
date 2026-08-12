"""
Wishlist Router — Add, remove, and view saved listings.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.wishlist import Wishlist
from app.models.listing import Listing
from app.models.user import User
from app.schemas.wishlist import WishlistRead, WishlistWithListing
from app.schemas.listing import ListingCard
from app.deps import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.post("/{listing_id}", response_model=WishlistRead, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a listing to the user's wishlist."""
    listing = db.query(Listing).filter(Listing.id == listing_id, Listing.is_active == True).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id, Wishlist.listing_id == listing_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Listing already in wishlist")

    item = Wishlist(user_id=current_user.id, listing_id=listing_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a listing from the user's wishlist."""
    item = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id, Wishlist.listing_id == listing_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()
    return None


@router.get("/me", response_model=List[WishlistWithListing])
def get_my_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return current user's saved wishlist entries with nested listing cards."""
    items = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )

    results = []
    for w in items:
        if not w.listing or not w.listing.is_active:
            continue
        cover_url = w.listing.photos[0].url if w.listing.photos else None
        review_cnt = w.listing.reviews.count()

        card = ListingCard(
            id=w.listing.id,
            title=w.listing.title,
            city=w.listing.city,
            country=w.listing.country,
            property_type=w.listing.property_type,
            price_per_night=w.listing.price_per_night,
            avg_rating=w.listing.avg_rating,
            cover_photo_url=cover_url,
            review_count=review_cnt,
        )
        res = WishlistWithListing(
            id=w.id,
            user_id=w.user_id,
            listing_id=w.listing_id,
            created_at=w.created_at,
            listing=card,
        )
        results.append(res)

    return results
