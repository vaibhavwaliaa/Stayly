"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Heart, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { toast } from "sonner";

interface ListingCardProps {
  listing: ListingCardType;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { user, isWishlisted, addToWishlist, removeFromWishlist } = useStore();
  const wishlisted = isWishlisted(listing.id);
  const [toggling, setToggling] = useState(false);

  // Superhost criteria: rating >= 4.8 and review_count >= 5 (or seeded high rating)
  const isSuperhost = listing.avg_rating >= 4.8 && listing.review_count >= 2;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please log in to save listings to your wishlist");
      return;
    }

    if (toggling) return;
    setToggling(true);

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
      // Rollback optimistic update on error
      if (wishlisted) {
        addToWishlist(listing.id);
      } else {
        removeFromWishlist(listing.id);
      }
      toast.error("Failed to update wishlist");
    } finally {
      setToggling(false);
    }
  };

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(listing.price_per_night);

  const defaultPhoto =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80";

  return (
    <Link href={`/listing/${listing.id}`} className="group block cursor-pointer">
      <div className="card-hover-effect rounded-2xl overflow-hidden border bg-card transition-all">
        {/* Photo Container */}
        <div className="relative aspect-4/3 sm:aspect-square bg-muted overflow-hidden">
          <img
            src={listing.cover_photo_url || defaultPhoto}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xs text-white transition-all z-10"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlisted ? "fill-[#E9385C] text-[#E9385C]" : "text-white"
              }`}
            />
          </button>

          {/* Superhost Badge */}
          {isSuperhost && (
            <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 text-foreground backdrop-blur-xs text-xs font-semibold px-2 py-0.5 border-none">
              ★ Superhost
            </Badge>
          )}

          {/* Property Type Pill */}
          <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
            {listing.property_type}
          </span>
        </div>

        {/* Info Content */}
        <div className="p-3.5 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-sm line-clamp-1 text-foreground group-hover:text-[#E9385C] transition-colors">
              {listing.title}
            </h3>
            {listing.avg_rating > 0 ? (
              <div className="flex items-center gap-1 text-xs font-medium shrink-0">
                <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                <span>{listing.avg_rating.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground shrink-0">New</span>
            )}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
            {listing.city}, {listing.country}
          </p>

          <div className="pt-1 flex items-baseline gap-1">
            <span className="font-bold text-sm text-foreground">{formattedPrice}</span>
            <span className="text-xs text-muted-foreground">night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
