"""
Reviews Router — Post reviews and list reviews per listing.
Recomputes listing avg_rating on review submission.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.review import Review
from app.models.listing import Listing
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewRead, ReviewPaginatedResponse, ReviewerSummary
from app.deps import get_current_user

router = APIRouter(tags=["Reviews"])


@router.post("/listings/{listing_id}/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(
    listing_id: int,
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Post a review for a listing.
    Recomputes and updates the listing's avg_rating after insertion.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # If booking_id is provided, validate ownership and completed status
    if payload.booking_id:
        booking = (
            db.query(Booking)
            .filter(
                Booking.id == payload.booking_id,
                Booking.listing_id == listing_id,
                Booking.guest_id == current_user.id,
            )
            .first()
        )
        if not booking:
            raise HTTPException(status_code=400, detail="Invalid booking_id for this user and listing")
        if booking.status != BookingStatus.completed:
            raise HTTPException(status_code=400, detail="Reviews can only be attached to completed stays")

    review = Review(
        listing_id=listing_id,
        guest_id=current_user.id,
        booking_id=payload.booking_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.flush()

    # Recompute avg_rating for the listing
    all_ratings = [r.rating for r in listing.reviews]
    if all_ratings:
        listing.avg_rating = round(sum(all_ratings) / len(all_ratings), 2)

    db.commit()
    db.refresh(review)

    reviewer = ReviewerSummary(
        id=current_user.id,
        name=current_user.name,
        avatar_url=current_user.avatar_url,
    )
    res = ReviewRead.model_validate(review)
    res.guest = reviewer
    return res


@router.get("/listings/{listing_id}/reviews", response_model=ReviewPaginatedResponse)
def get_listing_reviews(
    listing_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Return paginated list of public reviews for a listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    query = db.query(Review).filter(Review.listing_id == listing_id).order_by(Review.created_at.desc())
    total = query.count()

    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    results = []
    for r in items:
        guest_summary = None
        if r.guest:
            guest_summary = ReviewerSummary(
                id=r.guest.id,
                name=r.guest.name,
                avatar_url=r.guest.avatar_url,
            )
        read_obj = ReviewRead.model_validate(r)
        read_obj.guest = guest_summary
        results.append(read_obj)

    return ReviewPaginatedResponse(
        items=results,
        total=total,
        page=page,
        page_size=page_size,
    )
