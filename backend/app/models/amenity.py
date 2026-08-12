"""
Amenity model — the list of amenities (Wifi, Kitchen, Pool, etc.)
and the many-to-many join table linking amenities to listings.
"""

from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


# Many-to-many join table: listing_amenities
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    # Relationship — accessible via listing.amenities using secondary=
    listings = relationship(
        "Listing",
        secondary=listing_amenities,
        back_populates="amenities",
        lazy="dynamic",
    )

    def __repr__(self):
        return f"<Amenity(id={self.id}, name='{self.name}')>"
