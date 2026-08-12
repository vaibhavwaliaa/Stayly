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
    const scrollAmount = container.clientWidth * 0.8;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!listings || listings.length === 0) return null;

  return (
    <section className="space-y-2.5 group relative py-2">
      {/* Title Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#222222] tracking-tight flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition">
          {title}
          <div className="p-1 rounded-full hover:bg-[#F7F7F7] transition">
            <ArrowRight className="w-4 h-4 text-[#222222]" />
          </div>
        </h2>

        {/* Scroll Controls (Right arrows in light gray circles) */}
        <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => handleScroll("left")}
            className="w-7 h-7 rounded-full border border-[#DDDDDD] bg-white text-[#222222] shadow-xs flex items-center justify-center hover:scale-105 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="w-7 h-7 rounded-full border border-[#DDDDDD] bg-white text-[#222222] shadow-md flex items-center justify-center hover:scale-105 transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Row (7 cards fit across screen matching Airbnb screenshot) */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 pt-1"
      >
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="snap-start shrink-0 w-[175px] sm:w-[185px] md:w-[190px] lg:w-[192px]"
          >
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}
