"""
Availability service — date overlap validation logic.
"""

from datetime import date
from sqlalchemy.orm import Session
from app.models.booking import Booking, BookingStatus


def has_overlap(
    db: Session,
    listing_id: int,
    check_in: date,
    check_out: date,
    exclude_booking_id: int = None,
) -> bool:
    """
    Returns True if any CONFIRMED booking on that listing overlaps
    with [check_in, check_out).

    Half-open interval check:
    (existing.check_in < new_check_out) AND (existing.check_out > new_check_in)
    This correctly allows back-to-back bookings where one checkout date
    equals another's checkin date.
    """
    query = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == BookingStatus.confirmed,
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    )

    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)

    return query.first() is not None
