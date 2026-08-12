"""
User model — stores both guests and hosts.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_host = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    listings = relationship("Listing", back_populates="host", lazy="dynamic")
    bookings = relationship("Booking", back_populates="guest", lazy="dynamic")
    reviews = relationship("Review", back_populates="guest", lazy="dynamic")
    wishlists = relationship("Wishlist", back_populates="user", lazy="dynamic")

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}', is_host={self.is_host})>"
