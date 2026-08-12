"""
Listing model — the core property listing with all details.
"""

from sqlalchemy import (
    Column, Integer, String, Text, Float, Numeric, Boolean,
    DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.amenity import listing_amenities


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(String(50), nullable=False)  # apartment, house, cabin, villa
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    price_per_night = Column(Numeric(10, 2), nullable=False)
    max_guests = Column(Integer, nullable=False)
    bedrooms = Column(Integer, nullable=False)
    beds = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    avg_rating = Column(Float, default=0.0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    host = relationship("User", back_populates="listings")
    photos = relationship(
        "ListingPhoto",
        back_populates="listing",
        order_by="ListingPhoto.sort_order",
        cascade="all, delete-orphan",
        lazy="joined",
    )
    amenities = relationship(
        "Amenity",
        secondary=listing_amenities,
        back_populates="listings",
        lazy="joined",
    )
    bookings = relationship("Booking", back_populates="listing", lazy="dynamic")
    reviews = relationship("Review", back_populates="listing", lazy="dynamic")
    wishlists = relationship("Wishlist", back_populates="listing", lazy="dynamic")

    def __repr__(self):
        return f"<Listing(id={self.id}, title='{self.title}', city='{self.city}')>"
