"""
Booking schemas — request/response shapes for the booking flow.
BookingCreate only takes the user-facing fields; price is computed server-side.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


# ─── Create ───────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    """
    What the client sends to create a booking.
    Security note: nightly_rate_snapshot and total_price are computed
    server-side — never trust client-submitted prices.
    """
    listing_id: int = Field(..., examples=[1])
    check_in: date = Field(..., examples=["2025-09-15"])
    check_out: date = Field(..., examples=["2025-09-20"])
    guests_count: int = Field(..., ge=1, examples=[2])

    @model_validator(mode="after")
    def check_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        return self


# ─── Read ─────────────────────────────────────────────────────────────────────

class BookingListingSummary(BaseModel):
    """Lightweight listing info nested inside a booking response."""
    id: int
    title: str
    city: str
    cover_photo_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BookingRead(BaseModel):
    """Full booking representation in API responses."""
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests_count: int
    nightly_rate_snapshot: Decimal
    total_price: Decimal
    status: str
    created_at: datetime
    listing: Optional[BookingListingSummary] = None

    model_config = ConfigDict(from_attributes=True)


# ─── Availability ─────────────────────────────────────────────────────────────

class AvailabilityRange(BaseModel):
    """
    A booked date range — the frontend uses these to disable
    dates in the calendar picker.
    """
    check_in: date
    check_out: date

    model_config = ConfigDict(from_attributes=True)
