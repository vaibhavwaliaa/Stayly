"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ListingCard as ListingCardType, PaginatedResponse } from "@/lib/types";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import FilterSheet from "@/components/FilterSheet";
import DynamicMap from "@/components/DynamicMap";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SlidersHorizontal,
  Home,
  Palmtree,
  Mountain,
  Sparkles,
  Building2,
  Trees,
  Compass,
  SearchX,
  Map as MapIcon,
  LayoutGrid,
} from "lucide-react";

// Category Pill Items
const CATEGORIES = [
  { label: "All Stays", icon: Home, type: "" },
  { label: "Apartments", icon: Building2, type: "apartment" },
  { label: "Houses", icon: Home, type: "house" },
  { label: "Villas", icon: Sparkles, type: "villa" },
  { label: "Cabins", icon: Trees, type: "cabin" },
  { label: "Beachfront", icon: Palmtree, type: "" },
  { label: "Mountain Views", icon: Mountain, type: "" },
  { label: "Trending", icon: Compass, type: "" },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Read URL params
  const location = searchParams.get("location") || "";
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const guests = searchParams.get("guests") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const propertyType = searchParams.get("property_type") || "";
  const amenities = searchParams.getAll("amenities");

  // Construct query string for API
  const apiQueryParams = new URLSearchParams();
  if (location) apiQueryParams.set("location", location);
  if (checkIn) apiQueryParams.set("check_in", checkIn);
  if (checkOut) apiQueryParams.set("check_out", checkOut);
  if (guests) apiQueryParams.set("guests", guests);
  if (minPrice) apiQueryParams.set("min_price", minPrice);
  if (maxPrice) apiQueryParams.set("max_price", maxPrice);
  if (propertyType) apiQueryParams.set("property_type", propertyType);
  amenities.forEach((id) => apiQueryParams.append("amenities", id));
  apiQueryParams.set("page_size", "24");

  // Fetch listings from FastAPI backend
  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse<ListingCardType>>({
    queryKey: ["listings", apiQueryParams.toString()],
    queryFn: () => apiFetch<PaginatedResponse<ListingCardType>>(`/listings?${apiQueryParams.toString()}`),
  });

  const listings = data?.items || [];
  const totalCount = data?.total || 0;

  const handleCategorySelect = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) {
      params.set("property_type", type);
    } else {
      params.delete("property_type");
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background pb-16 relative">
      <Navbar />

      {/* Hero Search Section */}
      <div className="bg-gradient-to-b from-muted/50 to-background pt-6 pb-4 px-4 border-b">
        <SearchBar />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pt-6 space-y-6">
        {/* Category Pills & Filters Bar */}
        <div className="flex items-center justify-between gap-4 border-b pb-4">
          {/* Scrollable Category Pills */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = propertyType === cat.type && (cat.type !== "" || !propertyType);
              return (
                <button
                  key={cat.label}
                  onClick={() => handleCategorySelect(cat.type)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 pb-1 border-b-2 transition group ${
                    isActive
                      ? "border-foreground text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="text-xs whitespace-nowrap">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setFilterOpen(true)}
              className="rounded-full gap-2 text-xs font-semibold shrink-0 border shadow-xs hover:shadow-md"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#E9385C]" />
              Filters
              {(minPrice || maxPrice || propertyType || amenities.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-[#E9385C]" />
              )}
            </Button>
          </div>
        </div>

        {/* Results Header */}
        {!isLoading && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{listings.length}</strong> of{" "}
              <strong className="text-foreground">{totalCount}</strong> available stays
            </span>
          </div>
        )}

        {/* Main View: Normal Grid or Split Map View */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-1/3 rounded-md" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-destructive font-semibold">Failed to connect to backend server.</p>
            <p className="text-xs text-muted-foreground">
              Make sure FastAPI server is running at http://localhost:8000
            </p>
            <Button variant="outline" onClick={() => refetch()} className="rounded-full">
              Retry Connection
            </Button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 space-y-4 max-w-md mx-auto">
            <div className="p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center text-muted-foreground">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">No stays match your search</h3>
            <p className="text-sm text-muted-foreground">
              Try changing or clearing some of your filters or searching for a different destination.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-[#E9385C] hover:bg-[#D02B4C] text-white rounded-full text-xs font-semibold px-6"
            >
              Clear all filters
            </Button>
          </div>
        ) : showMap ? (
          /* Split View: Listings Left + Map Right */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto pr-2">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <div className="h-[75vh] sticky top-24">
              <DynamicMap listings={listings} />
            </div>
          </div>
        ) : (
          /* Full Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Map/Grid Toggle Button (Airbnb Signature Style) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <Button
          onClick={() => setShowMap(!showMap)}
          className="bg-[#222222] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-muted font-bold text-xs rounded-full px-6 py-6 shadow-2xl transition-all hover:scale-105 gap-2 border border-white/20"
        >
          {showMap ? (
            <>
              Show list <LayoutGrid className="w-4 h-4" />
            </>
          ) : (
            <>
              Show map <MapIcon className="w-4 h-4 text-[#E9385C]" />
            </>
          )}
        </Button>
      </div>

      <FilterSheet open={filterOpen} onOpenChange={setFilterOpen} />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Stayly...</div>}>
      <HomeContent />
    </Suspense>
  );
}
