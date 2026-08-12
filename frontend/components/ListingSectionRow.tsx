"use client";

import { useRef } from "react";
import ListingCard from "./ListingCard";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface ListingSectionRowProps {
  title: string;
  listings: ListingCardType[];
}

export default function ListingSectionRow({ title, listings }: ListingSectionRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75; // Scroll ~3 cards at a time

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!listings || listings.length === 0) return null;

  return (
    <section className="space-y-4 group relative py-2">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-[#222222] tracking-tight flex items-center gap-2">
          {title}
          <ArrowRight className="w-5 h-5 text-[#222222] transition-transform group-hover:translate-x-1" />
        </h2>

        {/* Scroll Controls (Desktop) */}
        <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => handleScroll("left")}
            className="w-8 h-8 rounded-full border border-[#DDDDDD] bg-white text-[#222222] shadow-md flex items-center justify-center hover:scale-105 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="w-8 h-8 rounded-full border border-[#DDDDDD] bg-white text-[#222222] shadow-md flex items-center justify-center hover:scale-105 transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Cards Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 pt-1"
      >
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="snap-start shrink-0 w-[280px] sm:w-[300px]"
          >
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}
