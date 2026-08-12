"""
Stayly Seed Data Script
Populates the database with realistic demo data.

IDEMPOTENT: If data already exists, this script does nothing.
Safe to call on every server restart without duplicating data.
"""

import random
from datetime import date, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.models.listing import Listing
from app.models.photo import ListingPhoto
from app.models.amenity import Amenity
from app.models.booking import Booking, BookingStatus
from app.models.review import Review

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── Unsplash Photo URLs ─────────────────────────────────────────────────────
# Freely-usable Unsplash CDN photos, appended with size/quality params
PHOTO_URLS = [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
]

# ─── Amenity Names ────────────────────────────────────────────────────────────
AMENITY_NAMES = [
    "Wifi", "Kitchen", "Free parking", "Pool", "Air conditioning",
    "Washer", "Dedicated workspace", "TV", "Pet friendly", "Self check-in",
]

# ─── Listing Data ─────────────────────────────────────────────────────────────
# 18 listings across 4 hosts, 6+ cities, varied property types
LISTINGS_DATA = [
    # Host 1 - Arjun (India focus)
    {
        "title": "Sun-Drenched Loft in Bandra",
        "description": "A bright, airy loft in the heart of Bandra West with floor-to-ceiling windows overlooking the Arabian Sea. Perfect for couples or solo travelers looking for a stylish Mumbai base.",
        "property_type": "apartment",
        "city": "Mumbai",
        "country": "India",
        "lat": 19.0596,
        "lng": 72.8295,
        "price_per_night": 4500,
        "max_guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
    },
    {
        "title": "Heritage Haveli in Old Delhi",
        "description": "Step back in time in this beautifully restored haveli with intricate Mughal-era jali work and a peaceful inner courtyard. Modern amenities meet centuries-old architecture.",
        "property_type": "house",
        "city": "Delhi",
        "country": "India",
        "lat": 28.6562,
        "lng": 77.2410,
        "price_per_night": 6000,
        "max_guests": 6,
        "bedrooms": 3,
        "beds": 4,
        "bathrooms": 2,
    },
    {
        "title": "Minimalist Studio Near Connaught Place",
        "description": "A sleek, modern studio apartment just a 10-minute walk from Connaught Place. Ideal for business travelers who want to be in the center of everything.",
        "property_type": "apartment",
        "city": "Delhi",
        "country": "India",
        "lat": 28.6315,
        "lng": 77.2167,
        "price_per_night": 2800,
        "max_guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
    },
    {
        "title": "Lakeside Villa in Udaipur",
        "description": "Wake up to stunning lake views in this luxurious villa perched on the hills of Udaipur. Features a private pool, rooftop terrace, and traditional Rajasthani décor.",
        "property_type": "villa",
        "city": "Udaipur",
        "country": "India",
        "lat": 24.5854,
        "lng": 73.7125,
        "price_per_night": 15000,
        "max_guests": 8,
        "bedrooms": 4,
        "beds": 5,
        "bathrooms": 3,
    },
    # Host 2 - Priya (Mix of India + International)
    {
        "title": "Cozy Houseboat on Dal Lake",
        "description": "Experience the magic of Kashmir from a traditional houseboat on Dal Lake. Hand-carved cedar interiors, shikaara rides at sunset, and mountain views you'll never forget.",
        "property_type": "house",
        "city": "Srinagar",
        "country": "India",
        "lat": 34.0837,
        "lng": 74.7973,
        "price_per_night": 5500,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1,
    },
    {
        "title": "Beachfront Cottage in Goa",
        "description": "A charming Portuguese-style cottage steps from Anjuna Beach. Hammocks in the garden, an outdoor shower, and the sound of waves as your morning alarm.",
        "property_type": "house",
        "city": "Goa",
        "country": "India",
        "lat": 15.5735,
        "lng": 73.7399,
        "price_per_night": 3800,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1,
    },
    {
        "title": "Modern Flat in Dubai Marina",
        "description": "A stunning high-rise apartment with panoramic views of the Dubai Marina skyline. Floor-to-ceiling windows, infinity pool access, and walking distance to JBR Beach.",
        "property_type": "apartment",
        "city": "Dubai",
        "country": "UAE",
        "lat": 25.0805,
        "lng": 55.1403,
        "price_per_night": 12000,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
    },
    {
        "title": "Chic Parisian Studio near Le Marais",
        "description": "A quintessentially Parisian pied-à-terre with wrought-iron balcony, herringbone floors, and views of Haussmann rooftops. Croissant shops and the Seine are minutes away.",
        "property_type": "apartment",
        "city": "Paris",
        "country": "France",
        "lat": 48.8566,
        "lng": 2.3522,
        "price_per_night": 9500,
        "max_guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
    },
    {
        "title": "Jungle Cabin in Manali",
        "description": "A hand-built wooden cabin nestled among deodar pines in Old Manali. Fireplace, mountain views from the deck, and absolute silence — the perfect digital detox.",
        "property_type": "cabin",
        "city": "Manali",
        "country": "India",
        "lat": 32.2396,
        "lng": 77.1887,
        "price_per_night": 2500,
        "max_guests": 3,
        "bedrooms": 1,
        "beds": 2,
        "bathrooms": 1,
    },
    # Host 3 - Marco (International focus)
    {
        "title": "Santorini Cave Suite with Caldera View",
        "description": "A whitewashed cave suite carved into the volcanic cliffs of Oia, with a private plunge pool and uninterrupted sunset views over the Aegean Sea.",
        "property_type": "villa",
        "city": "Santorini",
        "country": "Greece",
        "lat": 36.4618,
        "lng": 25.3753,
        "price_per_night": 22000,
        "max_guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
    },
    {
        "title": "Luxury Penthouse in Manhattan",
        "description": "A sprawling penthouse in Tribeca with wraparound terrace, chef's kitchen, and jaw-dropping views of the Hudson River and Freedom Tower.",
        "property_type": "apartment",
        "city": "New York",
        "country": "USA",
        "lat": 40.7163,
        "lng": -74.0086,
        "price_per_night": 25000,
        "max_guests": 6,
        "bedrooms": 3,
        "beds": 4,
        "bathrooms": 3,
    },
    {
        "title": "Traditional Riad in Marrakech Medina",
        "description": "An authentic Moroccan riad with hand-laid zellige tiles, a courtyard fountain, and a rooftop terrace overlooking the Atlas Mountains. Jemaa el-Fnaa is a 5-minute walk.",
        "property_type": "house",
        "city": "Marrakech",
        "country": "Morocco",
        "lat": 31.6295,
        "lng": -7.9811,
        "price_per_night": 7500,
        "max_guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 2,
    },
    {
        "title": "Treehouse Retreat in Bali",
        "description": "Sleep among the treetops in this eco-luxury bamboo treehouse surrounded by rice terraces. Open-air bathroom, yoga deck, and complimentary breakfast from a local warung.",
        "property_type": "cabin",
        "city": "Ubud",
        "country": "Indonesia",
        "lat": -8.5069,
        "lng": 115.2625,
        "price_per_night": 6500,
        "max_guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
    },
    # Host 4 - Sarah (Mix)
    {
        "title": "Hilltop Tea Estate Bungalow",
        "description": "A colonial-era bungalow set on a working tea plantation in Munnar. Misty mornings, estate-fresh chai, and endless green hills rolling to the horizon.",
        "property_type": "house",
        "city": "Munnar",
        "country": "India",
        "lat": 10.0889,
        "lng": 77.0595,
        "price_per_night": 4200,
        "max_guests": 6,
        "bedrooms": 3,
        "beds": 4,
        "bathrooms": 2,
    },
    {
        "title": "Artist's Loft in Pondicherry",
        "description": "A vibrant, art-filled loft in the French Quarter with original murals, a reading nook, and a terrace garden. The Promenade and Rock Beach are a short cycle ride away.",
        "property_type": "apartment",
        "city": "Pondicherry",
        "country": "India",
        "lat": 11.9416,
        "lng": 79.8083,
        "price_per_night": 3200,
        "max_guests": 3,
        "bedrooms": 1,
        "beds": 2,
        "bathrooms": 1,
    },
    {
        "title": "Ski Chalet in the Swiss Alps",
        "description": "A cozy timber chalet in Zermatt with direct views of the Matterhorn. Heated boot room, sauna, and a living room fireplace perfect for après-ski hot chocolate.",
        "property_type": "cabin",
        "city": "Zermatt",
        "country": "Switzerland",
        "lat": 46.0207,
        "lng": 7.7491,
        "price_per_night": 18000,
        "max_guests": 8,
        "bedrooms": 4,
        "beds": 6,
        "bathrooms": 3,
    },
    {
        "title": "Riverside Villa in Jaipur",
        "description": "A grand Rajasthani villa with a private courtyard, jharokha windows, and a rooftop pool. Centrally located between Hawa Mahal and Amer Fort.",
        "property_type": "villa",
        "city": "Jaipur",
        "country": "India",
        "lat": 26.9124,
        "lng": 75.7873,
        "price_per_night": 11000,
        "max_guests": 10,
        "bedrooms": 5,
        "beds": 6,
        "bathrooms": 4,
    },
    {
        "title": "Cozy Apartment in Shimla Mall Road",
        "description": "A warm, wood-paneled apartment overlooking Shimla's famous Mall Road and the snow-capped Himalayan peaks beyond. Walking distance to Christ Church and the Ridge.",
        "property_type": "apartment",
        "city": "Shimla",
        "country": "India",
        "lat": 31.1048,
        "lng": 77.1734,
        "price_per_night": 1800,
        "max_guests": 3,
        "bedrooms": 1,
        "beds": 2,
        "bathrooms": 1,
    },
]


def seed_database():
    """
    Populate the database with demo data.
    Idempotent — checks if users already exist before seeding.
    """
    db: Session = SessionLocal()
    try:
        # ── Idempotency check: if any users exist, skip seeding ──
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")
        random.seed(42)  # Reproducible randomness

        # ── 1. Create Users (4 hosts + 3 guests = 7 users) ──────────────
        hashed_pw = pwd_context.hash("password123")

        hosts = [
            User(name="Arjun Mehta", email="arjun@stayly.com", password_hash=hashed_pw, is_host=True,
                 avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun"),
            User(name="Priya Sharma", email="priya@stayly.com", password_hash=hashed_pw, is_host=True,
                 avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"),
            User(name="Marco Rossi", email="marco@stayly.com", password_hash=hashed_pw, is_host=True,
                 avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Marco"),
            User(name="Sarah Chen", email="sarah@stayly.com", password_hash=hashed_pw, is_host=True,
                 avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"),
        ]

        guests = [
            User(name="Rahul Kumar", email="rahul@example.com", password_hash=hashed_pw, is_host=False,
                 avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"),
            User(name="Emily Johnson", email="emily@example.com", password_hash=hashed_pw, is_host=False,
                 avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"),
            User(name="Ananya Patel", email="ananya@example.com", password_hash=hashed_pw, is_host=False,
                 avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"),
        ]

        all_users = hosts + guests
        db.add_all(all_users)
        db.flush()  # Get IDs assigned

        print(f"  Created {len(all_users)} users ({len(hosts)} hosts, {len(guests)} guests)")

        # ── 2. Create Amenities ──────────────────────────────────────────
        amenities = [Amenity(name=name) for name in AMENITY_NAMES]
        db.add_all(amenities)
        db.flush()

        print(f"  Created {len(amenities)} amenities")

        # ── 3. Create Listings ───────────────────────────────────────────
        # Assign listings to hosts: first 4 to host 0, next 5 to host 1,
        # next 4 to host 2, last 5 to host 3
        host_assignment = [0]*4 + [1]*5 + [2]*4 + [3]*5
        listings = []

        for i, data in enumerate(LISTINGS_DATA):
            listing = Listing(
                host_id=hosts[host_assignment[i]].id,
                **data,
            )
            listings.append(listing)

        db.add_all(listings)
        db.flush()

        print(f"  Created {len(listings)} listings")

        # ── 4. Attach Photos (4 per listing) ─────────────────────────────
        photos_created = 0
        for i, listing in enumerate(listings):
            for j in range(4):
                photo_idx = (i * 4 + j) % len(PHOTO_URLS)
                photo = ListingPhoto(
                    listing_id=listing.id,
                    url=PHOTO_URLS[photo_idx],
                    sort_order=j,
                )
                db.add(photo)
                photos_created += 1

        db.flush()
        print(f"  Created {photos_created} photos")

        # ── 5. Attach Amenities (random 4-8 per listing) ─────────────────
        amenity_links = 0
        for listing in listings:
            count = random.randint(4, 8)
            selected = random.sample(amenities, count)
            listing.amenities = selected
            amenity_links += count

        db.flush()
        print(f"  Created {amenity_links} listing-amenity associations")

        # ── 6. Create Bookings (10 total, no overlaps) ────────────────────
        today = date.today()
        bookings = []

        # Define booking specs: (listing_index, guest_index, days_offset_start, duration, is_past)
        booking_specs = [
            # Past bookings (completed)
            (0, 0, -60, 5, True),   # Rahul @ Mumbai, 60 days ago, 5 nights
            (1, 1, -45, 3, True),   # Emily @ Delhi Heritage, 45 days ago, 3 nights
            (4, 2, -30, 4, True),   # Ananya @ Kashmir, 30 days ago, 4 nights
            (6, 0, -20, 3, True),   # Rahul @ Dubai, 20 days ago, 3 nights
            (9, 1, -15, 5, True),   # Emily @ Santorini, 15 days ago, 5 nights
            (13, 2, -10, 3, True),  # Ananya @ Munnar, 10 days ago, 3 nights
            # Future bookings (confirmed)
            (2, 0, 10, 4, False),   # Rahul @ Delhi Studio, 10 days from now
            (5, 1, 15, 5, False),   # Emily @ Goa, 15 days from now
            (7, 2, 20, 7, False),   # Ananya @ Paris, 20 days from now
            (10, 0, 25, 3, False),  # Rahul @ Manhattan, 25 days from now
        ]

        for listing_idx, guest_idx, offset, duration, is_past in booking_specs:
            listing = listings[listing_idx]
            guest = guests[guest_idx]
            check_in = today + timedelta(days=offset)
            check_out = check_in + timedelta(days=duration)
            nightly_rate = float(listing.price_per_night)
            total = nightly_rate * duration

            booking = Booking(
                listing_id=listing.id,
                guest_id=guest.id,
                check_in=check_in,
                check_out=check_out,
                guests_count=min(2, listing.max_guests),
                nightly_rate_snapshot=nightly_rate,
                total_price=total,
                status=BookingStatus.completed if is_past else BookingStatus.confirmed,
            )
            bookings.append(booking)

        db.add_all(bookings)
        db.flush()

        print(f"  Created {len(bookings)} bookings")

        # ── 7. Create Reviews (8 reviews on completed bookings) ───────────
        review_data = [
            (0, 5, "Absolutely stunning loft! The sea views were incredible and Arjun was a wonderful host. Would book again in a heartbeat."),
            (1, 4, "The haveli is gorgeous and full of character. Only minor issue was the hot water timing, but the experience more than made up for it."),
            (2, 5, "Kashmir magic is real. The houseboat was immaculate, and Priya arranged a beautiful shikaara ride at sunset. Unforgettable."),
            (3, 4, "Great location in Dubai Marina. The apartment was clean and modern. Slight noise from construction nearby but otherwise perfect."),
            (4, 5, "Santorini dreams come true! The caldera view from the plunge pool at sunset was the highlight of our entire trip to Greece."),
            (5, 3, "The bungalow has charm and the tea plantation setting is lovely. Could use some updates to the bathroom fixtures, but a solid stay overall."),
            (0, 4, "Came back for a second stay. Still love it. The neighborhood has great cafes and the apartment is even better than the photos."),
            (3, 5, "Marco's Dubai place is top-notch. The infinity pool alone is worth it. Seamless self check-in and very responsive host."),
        ]

        reviews = []
        for booking_idx, rating, comment in review_data:
            booking = bookings[booking_idx]
            review = Review(
                listing_id=booking.listing_id,
                guest_id=booking.guest_id,
                booking_id=booking.id,
                rating=rating,
                comment=comment,
            )
            reviews.append(review)

        db.add_all(reviews)
        db.flush()

        print(f"  Created {len(reviews)} reviews")

        # ── 8. Recompute avg_rating for reviewed listings ─────────────────
        reviewed_listing_ids = set(r.listing_id for r in reviews)
        for listing_id in reviewed_listing_ids:
            listing_reviews = [r for r in reviews if r.listing_id == listing_id]
            avg = sum(r.rating for r in listing_reviews) / len(listing_reviews)
            listing_obj = db.query(Listing).filter(Listing.id == listing_id).first()
            if listing_obj:
                listing_obj.avg_rating = round(avg, 2)

        db.commit()
        print("  Updated avg_rating for reviewed listings")
        print("Database seeding complete!")

    except Exception as e:
        db.rollback()
        print(f"Seeding error: {e}")
        raise
    finally:
        db.close()
