"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { getListingPhotos } from "@/lib/photos";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { toast } from "sonner";

interface ListingCardProps {
  listing: ListingCardType;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const searchParams = useSearchParams();
  const { user, isWishlisted, addToWishlist, removeFromWishlist } = useStore();
  const wishlisted = isWishlisted(listing.id);

  // Carousel State
  const photos = getListingPhotos(listing.id, listing.cover_photo_url);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Heart Animation State
  const [toggling, setToggling] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // Check if date range is active in search params
  const checkInStr = searchParams.get("check_in");
  const checkOutStr = searchParams.get("check_out");

  let nights = 0;
  if (checkInStr && checkOutStr) {
    try {
      const d1 = parseISO(checkInStr);
      const d2 = parseISO(checkOutStr);
      nights = Math.max(1, differenceInCalendarDays(d2, d1));
    } catch {
      nights = 0;
    }
  }

  // Superhost / Guest Favourite badge criteria: avg_rating >= 4.8
  const isGuestFavourite = listing.avg_rating >= 4.8;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please log in to save listings to your wishlist");
      return;
    }

    if (toggling) return;
    setToggling(true);
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 200);

    try {
      if (wishlisted) {
        removeFromWishlist(listing.id);
        await apiFetch(`/wishlist/${listing.id}`, { method: "DELETE" });
        toast.success("Removed from wishlist");
      } else {
        addToWishlist(listing.id);
        await apiFetch(`/wishlist/${listing.id}`, { method: "POST" });
        toast.success("Saved to wishlist!");
      }
    } catch (err) {
      if (wishlisted) addToWishlist(listing.id);
      else removeFromWishlist(listing.id);
      toast.error("Failed to update wishlist");
    } finally {
      setToggling(false);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const pricePerNight = listing.price_per_night;
  const totalPriceForNights = pricePerNight * (nights || 2); // Default to 2 nights like Airbnb screenshot if no date

  const formattedNightPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(pricePerNight);

  const formattedTotalPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalPriceForNights);

  return (
    <Link href={`/listing/${listing.id}`} className="group block cursor-pointer">
      <div className="bg-transparent border-none space-y-2">
        {/* Photo Container with Carousel & Badges */}
        <div className="relative aspect-square w-full bg-[#EBEBEB] rounded-2xl overflow-hidden">
          <img
            src={photos[currentImageIndex]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
          />

          {/* Carousel Chevrons (visible on hover) */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 text-[#222222] hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 text-[#222222] hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Carousel Dot Indicators (centered bottom, visible on hover) */}
          {photos.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? "bg-white scale-125" : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}

          {/* "Guest favourite" Badge (top-left) */}
          {isGuestFavourite && (
            <div className="absolute top-2.5 left-2.5 bg-white/95 text-[#222222] font-semibold text-[11px] px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-xs z-10">
              Guest favourite
            </div>
          )}

          {/* Heart Icon Button (top-right) */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`absolute top-2.5 right-2.5 p-1 rounded-full transition-all duration-200 z-10 ${
              isHeartAnimating ? "scale-110" : "scale-100"
            }`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-colors stroke-[2.5] ${
                wishlisted
                  ? "fill-[#FF385C] text-[#FF385C] stroke-[#FF385C]"
                  : "fill-black/30 text-white stroke-white drop-shadow-md"
              }`}
            />
          </button>
        </div>

        {/* Text Content — Compact Airbnb Exact Layout */}
        <div className="space-y-0.5 text-left">
          {/* Row 1: Title (e.g. Apartment in Candolim / Title) */}
          <h3 className="font-semibold text-[14px] text-[#222222] truncate leading-tight">
            {listing.title}
          </h3>

          {/* Row 2: Subtext Price & Rating on same line (e.g. ₹15,485 for 2 nights · ★ 4.92) */}
          <div className="text-[13px] text-[#717171] truncate flex items-center gap-1">
            <span>
              {nights > 0
                ? `${formattedTotalPrice} for ${nights} ${nights === 1 ? "night" : "nights"}`
                : `${formattedNightPrice} night`}
            </span>
            {listing.avg_rating > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-[#222222] font-medium">
                  <Star className="w-3 h-3 fill-current text-[#222222]" />
                  {listing.avg_rating.toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
