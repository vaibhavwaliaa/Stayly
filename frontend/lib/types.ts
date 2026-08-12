/**
 * Stayly TypeScript Interfaces
 *
 * These mirror the backend Pydantic Read schemas exactly.
 * Field names are identical to the backend JSON to avoid silent mismatches.
 */

// ─── User ──────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  is_host: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface HostSummary {
  id: number;
  name: string;
  avatar_url: string | null;
  host_since: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ─── Amenity ───────────────────────────────────────────────────────────────

export interface Amenity {
  id: number;
  name: string;
}

// ─── Photo ─────────────────────────────────────────────────────────────────

export interface Photo {
  id: number;
  listing_id: number;
  url: string;
  sort_order: number;
}

// ─── Listing ───────────────────────────────────────────────────────────────

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  country: string;
  property_type: string;
  price_per_night: number;
  avg_rating: number;
  cover_photo_url: string | null;
  review_count: number;
}

export interface ListingDetail {
  id: number;
  host_id: number;
  title: string;
  description: string;
  property_type: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  avg_rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  photos: Photo[];
  amenities: Amenity[];
  host: HostSummary | null;
  review_count: number;
}

// ─── Booking ───────────────────────────────────────────────────────────────

export interface BookingListingSummary {
  id: number;
  title: string;
  city: string;
  cover_photo_url: string | null;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  nightly_rate_snapshot: number;
  total_price: number;
  status: "confirmed" | "cancelled" | "completed";
  created_at: string;
  listing: BookingListingSummary | null;
}

// ─── Review ────────────────────────────────────────────────────────────────

export interface ReviewerSummary {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface Review {
  id: number;
  listing_id: number;
  guest_id: number;
  booking_id: number | null;
  rating: number;
  comment: string;
  created_at: string;
  guest: ReviewerSummary | null;
}

// ─── Availability ──────────────────────────────────────────────────────────

export interface AvailabilityRange {
  check_in: string;
  check_out: string;
}

// ─── Wishlist ──────────────────────────────────────────────────────────────

export interface WishlistWithListing {
  id: number;
  user_id: number;
  listing_id: number;
  created_at: string;
  listing: ListingCard;
}

// ─── Paginated Response ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

