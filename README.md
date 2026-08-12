# Stayly — Full-Stack Airbnb Clone

A functional, modern full-stack Airbnb-style booking platform featuring property browsing, search with date & capacity filters, interactive Leaflet map view, booking flow with date overlap validation, host dashboard with CRUD controls, user wishlists, and post-stay reviews.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **State & Data Fetching**: TanStack React Query v5, Zustand (persisted state)
- **UI Components**: Lucide Icons, react-day-picker, Sonner Toasts, Leaflet & React-Leaflet
- **Theming**: next-themes (Dark & Light mode support)

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM & DB**: SQLAlchemy 2.0, SQLite (8 relational tables with constraints)
- **Validation**: Pydantic v2 schemas
- **Authentication**: JWT (python-jose, HS256 algorithm), bcrypt password hashing via passlib

---

## Architecture Overview

```
                        ┌────────────────────────┐
                        │    Next.js Frontend    │
                        │ (App Router + Zustand) │
                        └───────────┬────────────┘
                                    │
                              HTTP / REST
                               (JWT Bearer)
                                    │
                        ┌───────────▼────────────┐
                        │    FastAPI Backend     │
                        │ (Pydantic + SQLA 2.0)  │
                        └───────────┬────────────┘
                                    │
                        ┌───────────▼────────────┐
                        │    SQLite Database     │
                        │      (8 Tables)        │
                        └────────────────────────┘
```

The frontend runs as a single-page application built on Next.js App Router. State management for authentication tokens and wishlist items is handled client-side via a persisted Zustand store. All network requests are routed through a typed API client (`lib/api.ts`) that automatically attaches `Authorization: Bearer <token>` headers to authenticated endpoints.

The FastAPI backend handles business logic, database migrations via SQLAlchemy `Base.metadata.create_all()`, idempotent demo data seeding, half-open interval booking date overlap checks, and password verification.

---

## Database Schema (8 Tables)

| Table | Key Columns | Description & Constraints |
|-------|-------------|---------------------------|
| `users` | `id`, `name`, `email`, `password_hash`, `is_host`, `avatar_url`, `created_at` | Stores guest and host user profiles. `email` is unique and indexed. |
| `listings` | `id`, `host_id`, `title`, `description`, `property_type`, `city`, `country`, `lat`, `lng`, `price_per_night`, `max_guests`, `bedrooms`, `beds`, `bathrooms`, `avg_rating`, `is_active`, `created_at`, `updated_at` | Core property listings. `host_id` FK -> `users.id`. Soft deletes via `is_active=False`. |
| `listing_photos` | `id`, `listing_id`, `url`, `sort_order` | Ordered gallery photos for listings. FK -> `listings.id` with CASCADE. |
| `amenities` | `id`, `name` | Property amenities list (Wifi, Pool, Kitchen, etc.). `name` is unique. |
| `listing_amenities` | `listing_id`, `amenity_id` | Composite primary key join table linking listings and amenities. |
| `bookings` | `id`, `listing_id`, `guest_id`, `check_in`, `check_out`, `guests_count`, `nightly_rate_snapshot`, `total_price`, `status`, `created_at` | Reservations table. `status` ENUM (`confirmed`, `cancelled`, `completed`). Check constraint: `check_out > check_in`. |
| `reviews` | `id`, `listing_id`, `guest_id`, `booking_id`, `rating`, `comment`, `created_at` | Guest reviews. Rating check constraint (`1-5`). `booking_id` nullable (SET NULL on delete). |
| `wishlists` | `id`, `user_id`, `listing_id`, `created_at` | Saved user favorites. Unique constraint on `(user_id, listing_id)`. |

---

## API Endpoints Overview

### Auth Endpoints
- `POST /auth/register` — Create a new user account (returns JWT)
- `POST /auth/login` — Authenticate email/password (returns JWT)
- `GET /auth/me` — Return current logged-in user profile
- `PATCH /auth/me` — Update user profile / toggle host status

### Listings & Amenities Endpoints
- `GET /listings` — Search & filter active listings (location, dates, guests, price, property_type, amenities, pagination)
- `GET /listings/{id}` — Full listing details (photos, amenities, host, rating, reviews count)
- `GET /listings/{id}/availability` — Confirmed booked date ranges for calendar blocking
- `GET /amenities` — List all available property amenities
- `POST /listings` — Create a new listing (Host required)
- `PUT /listings/{id}` — Full update of listing (Owner required)
- `DELETE /listings/{id}` — Soft-delete listing (Owner required)

### Bookings Endpoints
- `POST /bookings` — Create a reservation with date overlap validation (returns 409 on conflict)
- `GET /bookings/me` — Return authenticated user's trips
- `GET /bookings/listings/{listing_id}` — Owner-only listing reservation history
- `PATCH /bookings/{id}/cancel` — Cancel a booking (Guest or Host only)

### Wishlist & Reviews Endpoints
- `POST /wishlist/{listing_id}` — Save listing to user wishlist
- `DELETE /wishlist/{listing_id}` — Remove listing from user wishlist
- `GET /wishlist/me` — List user's saved wishlist items with full listing cards
- `POST /listings/{id}/reviews` — Submit a review & auto-recompute listing's `avg_rating`
- `GET /listings/{id}/reviews` — List public reviews for a listing

---

## Local Setup & Development Instructions

### Prerequisites
- Node.js 20 LTS or newer
- Python 3.11 or newer

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI server (runs at http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```
> Note: Database tables and idempotent seed data (18 listings, 7 users, 10 bookings, 8 reviews) are created automatically on server startup. Open `http://localhost:8000/docs` to inspect the Swagger UI.

### 2. Frontend Setup (Next.js)
```bash
# In a new terminal window, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server (runs at http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start exploring Stayly!

---

## Assumptions & Simplifications

1. **Authentication**: Uses stateless JWT bearer tokens stored in localStorage via Zustand persist middleware for demo convenience.
2. **Payments**: Payment flow is simulated in a modal checkout dialog with a realistic 1.5s loading delay and client-side credit card input formatting without connecting to a real gateway like Stripe.
3. **Photo Uploads**: Uses reliable Unsplash CDN image URLs instead of local file uploads to ensure high-resolution demonstration imagery.
4. **Database Engine**: Uses SQLite (`app.db`) for lightweight, zero-configuration local persistence.

---

## Bonus Features Implemented

- [x] **Interactive Leaflet Map**: Floating "Show map" / "Show list" toggle button on the home page offering a split view with dynamic OpenStreetMap markers and popups.
- [x] **Superhost Badge**: Computed client-side for listings with `avg_rating >= 4.8` and `review_count >= 2`.
- [x] **Post-Stay Verified Reviews**: Guests with a completed stay on a property unlock a "Write a review" modal button on the listing detail page, updating the property's average rating live.
- [x] **Dark Mode**: Smooth theme switching using `next-themes` and custom CSS variables.
