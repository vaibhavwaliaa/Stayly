"""
Listings Router — Public search, detail views, and host CRUD endpoints.
"""

from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.database import get_db
from app.models.listing import Listing
from app.models.photo import ListingPhoto
from app.models.amenity import Amenity, listing_amenities
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.listing import (
    ListingRead,
    ListingCard,
    ListingPaginatedResponse,
    ListingCreate,
    ListingUpdate,
)
from app.schemas.amenity import AmenityRead
from app.schemas.booking import AvailabilityRange
from app.schemas.user import HostSummary
from app.services.availability import has_overlap
from app.deps import get_current_user, get_current_host

router = APIRouter(tags=["Listings"])


@router.get("/listings", response_model=ListingPaginatedResponse)
def get_listings(
    location: Optional[str] = Query(None, description="City or country search"),
    check_in: Optional[date] = Query(None),
    check_out: Optional[date] = Query(None),
    guests: Optional[int] = Query(None, ge=1),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    property_type: Optional[str] = Query(None),
    amenities: Optional[List[int]] = Query(None, description="Repeated amenity IDs"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """
    Search and filter active listings.
    Supports location partial matching, date availability exclusion, guest capacity, price range, property type, and amenity filtering.
    """
    query = db.query(Listing).filter(Listing.is_active == True)

    # 1. Location match (city OR country)
    if location:
        pattern = f"%{location.strip()}%"
        query = query.filter(
            or_(
                Listing.city.ilike(pattern),
                Listing.country.ilike(pattern),
                Listing.title.ilike(pattern),
            )
        )

    # 2. Capacity filter
    if guests:
        query = query.filter(Listing.max_guests >= guests)

    # 3. Price range filter
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    # 4. Property type filter
    if property_type:
        query = query.filter(Listing.property_type.lower() == property_type.lower())

    # 5. Amenity filter (must contain ALL specified amenity IDs)
    if amenities:
        for amenity_id in amenities:
            query = query.filter(
                Listing.amenities.any(Amenity.id == amenity_id)
            )

    # 6. Date availability filter (exclude listings with overlapping confirmed bookings)
    if check_in and check_out:
        if check_out <= check_in:
            raise HTTPException(status_code=400, detail="check_out must be after check_in")

        # Find listing IDs that HAVE an overlapping confirmed booking
        overlapping_ids = (
            db.query(Booking.listing_id)
            .filter(
                Booking.status == BookingStatus.confirmed,
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
            .distinct()
            .all()
        )
        exclude_ids = [row[0] for row in overlapping_ids]
        if exclude_ids:
            query = query.filter(~Listing.id.in_(exclude_ids))

    total = query.count()

    # Pagination
    offset = (page - 1) * page_size
    items = query.order_by(Listing.created_at.desc()).offset(offset).limit(page_size).all()

    # Format into ListingCard items
    cards = []
    for l in items:
        cover_url = l.photos[0].url if l.photos else None
        review_cnt = l.reviews.count()
        cards.append(
            ListingCard(
                id=l.id,
                title=l.title,
                city=l.city,
                country=l.country,
                property_type=l.property_type,
                price_per_night=l.price_per_night,
                avg_rating=l.avg_rating,
                cover_photo_url=cover_url,
                review_count=review_cnt,
            )
        )

    return ListingPaginatedResponse(
        items=cards,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/amenities", response_model=List[AmenityRead])
def get_amenities(db: Session = Depends(get_db)):
    """Return all available amenities."""
    return db.query(Amenity).all()


@router.get("/listings/{listing_id}", response_model=ListingRead)
def get_listing_detail(listing_id: int, db: Session = Depends(get_db)):
    """Full detail view for a specific listing."""
    listing = db.query(Listing).filter(Listing.id == listing_id, Listing.is_active == True).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or inactive")

    host_summary = None
    if listing.host:
        host_summary = HostSummary(
            id=listing.host.id,
            name=listing.host.name,
            avatar_url=listing.host.avatar_url,
            host_since=listing.host.created_at,
        )

    review_cnt = listing.reviews.count()

    result = ListingRead.model_validate(listing)
    result.host = host_summary
    result.review_count = review_cnt
    return result


@router.get("/listings/{listing_id}/availability", response_model=List[AvailabilityRange])
def get_listing_availability(listing_id: int, db: Session = Depends(get_db)):
    """Return booked date ranges for calendar picker date-blocking."""
    bookings = (
        db.query(Booking)
        .filter(Booking.listing_id == listing_id, Booking.status == BookingStatus.confirmed)
        .all()
    )
    return [AvailabilityRange(check_in=b.check_in, check_out=b.check_out) for b in bookings]


@router.post("/listings", response_model=ListingRead, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    """Create a new listing (Host only)."""
    listing = Listing(
        host_id=current_user.id,
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        city=payload.city,
        country=payload.country,
        lat=payload.lat,
        lng=payload.lng,
        price_per_night=payload.price_per_night,
        max_guests=payload.max_guests,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        bathrooms=payload.bathrooms,
        is_active=True,
    )
    db.add(listing)
    db.flush()

    # Photos
    for idx, url in enumerate(payload.photo_urls):
        photo = ListingPhoto(listing_id=listing.id, url=url, sort_order=idx)
        db.add(photo)

    # Amenities
    if payload.amenity_ids:
        amenities = db.query(Amenity).filter(Amenity.id.in_(payload.amenity_ids)).all()
        listing.amenities = amenities

    db.commit()
    db.refresh(listing)

    host_summary = HostSummary(
        id=current_user.id,
        name=current_user.name,
        avatar_url=current_user.avatar_url,
        host_since=current_user.created_at,
    )
    res = ListingRead.model_validate(listing)
    res.host = host_summary
    return res


@router.put("/listings/{listing_id}", response_model=ListingRead)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    current_user: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    """Update a listing (Owner only)."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this listing")

    for field, val in payload.model_dump(exclude_unset=True).items():
        if field not in ("amenity_ids", "photo_urls"):
            setattr(listing, field, val)

    # Replace photos if provided
    if payload.photo_urls is not None:
        db.query(ListingPhoto).filter(ListingPhoto.listing_id == listing_id).delete()
        for idx, url in enumerate(payload.photo_urls):
            photo = ListingPhoto(listing_id=listing.id, url=url, sort_order=idx)
            db.add(photo)

    # Replace amenities if provided
    if payload.amenity_ids is not None:
        amenities = db.query(Amenity).filter(Amenity.id.in_(payload.amenity_ids)).all()
        listing.amenities = amenities

    db.commit()
    db.refresh(listing)

    host_summary = HostSummary(
        id=current_user.id,
        name=current_user.name,
        avatar_url=current_user.avatar_url,
        host_since=current_user.created_at,
    )
    res = ListingRead.model_validate(listing)
    res.host = host_summary
    return res


@router.delete("/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    """Soft delete a listing by setting is_active = False (Owner only)."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this listing")

    listing.is_active = False
    db.commit()
    return None
