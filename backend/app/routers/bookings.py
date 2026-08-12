"""
Bookings Router — reservation creation, my-trips, owner listing bookings, and cancellation.
"""

from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.listing import Listing
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingRead, BookingListingSummary
from app.services.availability import has_overlap
from app.deps import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new booking reservation.
    Validates check_out > check_in, guest capacity, listing existence, and checks for date overlaps.
    """
    listing = db.query(Listing).filter(Listing.id == payload.listing_id, Listing.is_active == True).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or inactive")

    if payload.guests_count > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"Guest count exceeds maximum allowed ({listing.max_guests})",
        )

    # Overlap validation check
    if has_overlap(db, payload.listing_id, payload.check_in, payload.check_out):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Selected dates are no longer available. Please choose another range.",
        )

    nights = (payload.check_out - payload.check_in).days
    nightly_rate = float(listing.price_per_night)
    total_price = nightly_rate * nights

    booking = Booking(
        listing_id=listing.id,
        guest_id=current_user.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests_count=payload.guests_count,
        nightly_rate_snapshot=nightly_rate,
        total_price=total_price,
        status=BookingStatus.confirmed,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    cover_photo = listing.photos[0].url if listing.photos else None
    summary = BookingListingSummary(
        id=listing.id,
        title=listing.title,
        city=listing.city,
        cover_photo_url=cover_photo,
    )

    res = BookingRead.model_validate(booking)
    res.listing = summary
    return res


@router.get("/me", response_model=List[BookingRead])
def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all bookings for the currently authenticated user."""
    bookings = (
        db.query(Booking)
        .filter(Booking.guest_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    results = []
    for b in bookings:
        cover_photo = b.listing.photos[0].url if b.listing and b.listing.photos else None
        summary = None
        if b.listing:
            summary = BookingListingSummary(
                id=b.listing.id,
                title=b.listing.title,
                city=b.listing.city,
                cover_photo_url=cover_photo,
            )
        read_obj = BookingRead.model_validate(b)
        read_obj.listing = summary
        results.append(read_obj)

    return results


@router.get("/listings/{listing_id}", response_model=List[BookingRead])
def get_owner_listing_bookings(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Owner-only: return all bookings for a specific listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this listing")

    bookings = (
        db.query(Booking)
        .filter(Booking.listing_id == listing_id)
        .order_by(Booking.check_in.desc())
        .all()
    )
    return [BookingRead.model_validate(b) for b in bookings]


@router.patch("/{booking_id}/cancel", response_model=BookingRead)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel a booking (Guest or Listing Host only)."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    is_guest = booking.guest_id == current_user.id
    is_host = booking.listing and booking.listing.host_id == current_user.id

    if not is_guest and not is_host:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    booking.status = BookingStatus.cancelled
    db.commit()
    db.refresh(booking)

    cover_photo = booking.listing.photos[0].url if booking.listing and booking.listing.photos else None
    summary = None
    if booking.listing:
        summary = BookingListingSummary(
            id=booking.listing.id,
            title=booking.listing.title,
            city=booking.listing.city,
            cover_photo_url=cover_photo,
        )
    res = BookingRead.model_validate(booking)
    res.listing = summary
    return res
