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

  let nights = 2; // Default to 2 nights like Airbnb screenshot
  if (checkInStr && checkOutStr) {
    try {
      const d1 = parseISO(checkInStr);
      const d2 = parseISO(checkOutStr);
      nights = Math.max(1, differenceInCalendarDays(d2, d1));
    } catch {
      nights = 2;
    }
  }

  // Guest favourite badge criteria: avg_rating >= 4.7
  const isGuestFavourite = listing.avg_rating >= 4.7;

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
    } catch {
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
  const totalPrice = pricePerNight * nights;

  const formattedTotalPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalPrice);

  return (
    <Link href={`/listing/${listing.id}`} className="group block cursor-pointer">
      <div className="bg-transparent border-none flex flex-col h-full">
        {/* Photo Container with Carousel & Badges */}
        <div className="relative aspect-[20/19] w-full bg-[#EBEBEB] rounded-[12px] overflow-hidden">
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
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-[#222222] hover:bg-white hover:scale-105 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
              >
                <ChevronLeft className="w-4 h-4 mr-0.5" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-[#222222] hover:bg-white hover:scale-105 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
              >
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
            </>
          )}

          {/* Carousel Dot Indicators */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`rounded-full transition-all ${
                    idx === currentImageIndex 
                      ? "bg-white w-[6px] h-[6px]" 
                      : "bg-white/60 w-[5px] h-[5px]"
                  }`}
                />
              ))}
            </div>
          )}

          {/* "Guest favourite" Badge (top-left) */}
          {isGuestFavourite && (
            <div className="absolute top-3 left-3 bg-white/95 text-[#222222] font-semibold text-[13px] px-3 py-1 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.18)] z-10">
              Guest favourite
            </div>
          )}

          {/* Heart Icon Button (top-right) */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-0.5 transition-all duration-200 z-10 ${
              isHeartAnimating ? "scale-110" : "scale-100"
            }`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-[26px] h-[26px] transition-colors stroke-[2] ${
                wishlisted
                  ? "fill-[#FF385C] text-[#FF385C] stroke-[#FF385C]"
                  : "fill-black/50 text-white stroke-white drop-shadow-md"
              }`}
            />
          </button>
        </div>

        {/* Text Content — Exact Airbnb Formatting */}
        <div className="mt-3 text-left">
          {/* Row 1: Title on left, Rating on right */}
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-[15px] text-[#222222] truncate leading-tight pr-4">
              {listing.title}
            </h3>
            {listing.avg_rating > 0 && (
              <div className="flex items-center gap-1 shrink-0 text-[#222222]">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[15px] font-normal leading-tight">{listing.avg_rating.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Row 2: Secondary Info */}
          <div className="text-[15px] text-[#717171] truncate leading-[1.3] mt-0.5">
            {listing.property_type ? `${listing.property_type.charAt(0).toUpperCase()}${listing.property_type.slice(1)}` : "Stay"}
          </div>

          {/* Row 3: Price */}
          <div className="mt-1.5 flex items-baseline gap-1 text-[15px] leading-tight text-[#222222]">
            <span className="font-semibold">{formattedTotalPrice}</span>
            <span className="font-normal">total before taxes</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
