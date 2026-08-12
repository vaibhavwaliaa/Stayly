"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { WishlistWithListing, ListingCard as ListingCardType } from "@/lib/types";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, SearchX } from "lucide-react";
import { toast } from "sonner";

export default function WishlistPage() {
  const router = useRouter();
  const { user, wishlistIds } = useStore();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.info("Please log in to view your wishlist");
      router.push("/");
    }
  }, [user, router]);

  // Fetch wishlisted items with full listing cards
  const { data: wishlistData, isLoading, isError } = useQuery<WishlistWithListing[]>({
    queryKey: ["my-wishlist"],
    queryFn: () => apiFetch<WishlistWithListing[]>("/wishlist/me"),
    enabled: !!user,
  });

  // Filter out any items that were un-hearted in the Zustand store
  const savedListings =
    wishlistData
      ?.filter((item) => wishlistIds.includes(item.listing_id))
      .map((item) => item.listing) || [];

  return (
    <main className="min-h-screen flex flex-col bg-background pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-8 flex-1">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Heart className="w-7 h-7 text-[#E9385C] fill-[#E9385C]" />
              Your Wishlist
            </h1>
            <p className="text-sm text-muted-foreground">
              Saved stays you love and want to revisit later.
            </p>
          </div>
          <span className="text-sm font-semibold text-muted-foreground">
            {savedListings.length} {savedListings.length === 1 ? "saved stay" : "saved stays"}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-destructive font-semibold">Failed to load wishlist.</p>
          </div>
        ) : savedListings.length === 0 ? (
          <div className="text-center py-20 border rounded-3xl bg-card space-y-4 max-w-md mx-auto">
            <div className="p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center text-muted-foreground">
              <Heart className="w-8 h-8 text-[#E9385C]" />
            </div>
            <h3 className="text-xl font-bold">Your wishlist is empty</h3>
            <p className="text-sm text-muted-foreground">
              As you search, click the heart icon on any stay to save your favorite places here.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-[#E9385C] hover:bg-[#D02B4C] text-white rounded-full font-semibold px-6"
            >
              Explore Listings
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
