"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ListingCard as ListingCardType, PaginatedResponse } from "@/lib/types";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import ListingSectionRow from "@/components/ListingSectionRow";
import ListingSkeleton from "@/components/ListingSkeleton";
import FilterSheet from "@/components/FilterSheet";
import DynamicMap from "@/components/DynamicMap";
import { Button } from "@/components/ui/button";
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

// Secondary Filter Items
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

  const hasActiveFilters = Boolean(
    location || checkIn || checkOut || guests || minPrice || maxPrice || propertyType || amenities.length > 0
  );

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
  apiQueryParams.set("page_size", "36");

  // Fetch listings from FastAPI backend
  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse<ListingCardType>>({
    queryKey: ["listings", apiQueryParams.toString()],
    queryFn: () => apiFetch<PaginatedResponse<ListingCardType>>(`/listings?${apiQueryParams.toString()}`),
  });

  const listings = data?.items || [];

  // Guarantee 7 listings per section row like the reference Airbnb screenshot
  const section1Listings = listings.slice(0, 7);
  const section2Listings = listings.length >= 14 ? listings.slice(7, 14) : listings.slice(0, 7);

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
    <main className="min-h-screen flex flex-col bg-background pb-20 relative">
      {/* Unified Header: Logo, 3D Top Tabs, Menu Pill + Centered SearchBar */}
      <Header />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pt-4 space-y-6">
        {/* Secondary Category Filter Row & Filters Drawer Trigger */}
        <div className="flex items-center justify-between gap-4 border-b border-[#DDDDDD] pb-2">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-none py-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = propertyType === cat.type && (cat.type !== "" || !propertyType);
              return (
                <button
                  key={cat.label}
                  onClick={() => handleCategorySelect(cat.type)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 pb-2 transition-all group relative px-2.5 py-1 rounded-xl hover:bg-[#F7F7F7] ${
                    isActive ? "text-[#222222] font-semibold" : "text-[#717171] hover:text-[#222222]"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                      isActive ? "text-[#222222]" : "text-[#717171] group-hover:text-[#222222]"
                    }`}
                  />
                  <span className="text-[12px] tracking-tight whitespace-nowrap">{cat.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#222222] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="rounded-full gap-2 text-xs font-semibold shrink-0 border border-[#DDDDDD] shadow-xs hover:shadow-md py-4 px-3.5 text-[#222222]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#222222]" />
            Filters
            {(minPrice || maxPrice || propertyType || amenities.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-[#FF385C]" />
            )}
          </Button>
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {Array.from({ length: 14 }).map((_, i) => (
              <ListingSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-destructive font-semibold">Failed to connect to backend server.</p>
            <p className="text-xs text-[#717171]">
              Make sure FastAPI server is running at http://localhost:8000
            </p>
            <Button variant="outline" onClick={() => refetch()} className="rounded-full">
              Retry Connection
            </Button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 space-y-4 max-w-md mx-auto">
            <div className="p-4 rounded-full bg-[#F7F7F7] w-16 h-16 mx-auto flex items-center justify-center text-[#717171]">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#222222]">No stays match your search</h3>
            <p className="text-sm text-[#717171]">
              Try changing or clearing some of your filters or searching for a different destination.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-full text-xs font-semibold px-6 py-2.5"
            >
              Clear all filters
            </Button>
          </div>
        ) : showMap ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[78vh] overflow-y-auto pr-2 scrollbar-none">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <div className="h-[78vh] sticky top-24">
              <DynamicMap listings={listings} />
            </div>
          </div>
        ) : !hasActiveFilters ? (
          /* Default Airbnb Replica View: Section Rows with 7 cards each matching exact screenshot */
          <div className="space-y-10">
            {section1Listings.length > 0 && (
              <ListingSectionRow
                title="Popular homes in North Goa"
                listings={section1Listings}
              />
            )}

            {section2Listings.length > 0 && (
              <ListingSectionRow
                title="Available in Lonavala this weekend"
                listings={section2Listings}
              />
            )}

            <section className="space-y-4 pt-4 border-t border-[#DDDDDD]">
              <h2 className="text-[20px] font-bold text-[#222222] tracking-tight">
                All Places to Stay
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* Filter Active Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Map Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <Button
          onClick={() => setShowMap(!showMap)}
          className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] hover:bg-black font-bold text-xs rounded-full px-6 py-5 shadow-2xl transition-all hover:scale-105 gap-2 border border-white/20"
        >
          {showMap ? (
            <>
              Show list <LayoutGrid className="w-4 h-4" />
            </>
          ) : (
            <>
              Show map <MapIcon className="w-4 h-4 text-[#FF385C]" />
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
    <Suspense fallback={<div className="p-8 text-center text-[#717171]">Loading Stayly...</div>}>
      <HomeContent />
    </Suspense>
  );
}
