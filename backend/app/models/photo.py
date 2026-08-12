"""
Listing Photo model — ordered photos for each listing.
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ListingPhoto(Base):
    __tablename__ = "listing_photos"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(1000), nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    # Relationship
    listing = relationship("Listing", back_populates="photos")

    def __repr__(self):
        return f"<ListingPhoto(id={self.id}, listing_id={self.listing_id}, sort_order={self.sort_order})>"
