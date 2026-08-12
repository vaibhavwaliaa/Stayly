"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Calendar as CalendarIcon, Users, Plus, Minus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial state from URL
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const initialCheckIn = searchParams.get("check_in");
  const initialCheckOut = searchParams.get("check_out");

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (initialCheckIn && initialCheckOut) {
      try {
        return {
          from: parseISO(initialCheckIn),
          to: parseISO(initialCheckOut),
        };
      } catch {
        return undefined;
      }
    }
    return undefined;
  });

  const [guests, setGuests] = useState<number>(() => {
    const count = parseInt(searchParams.get("guests") || "1", 10);
    return isNaN(count) ? 1 : Math.max(1, count);
  });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (dateRange?.from) params.set("check_in", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to) params.set("check_out", format(dateRange.to, "yyyy-MM-dd"));
    if (guests > 1) params.set("guests", guests.toString());

    // Retain filters if present
    const currentType = searchParams.get("property_type");
    if (currentType) params.set("property_type", currentType);

    const currentMin = searchParams.get("min_price");
    if (currentMin) params.set("min_price", currentMin);

    const currentMax = searchParams.get("max_price");
    if (currentMax) params.set("max_price", currentMax);

    router.push(`/?${params.toString()}`);
  };

  const handleClear = () => {
    setLocation("");
    setDateRange(undefined);
    setGuests(1);
    router.push("/");
  };

  const hasFilters = location || dateRange?.from || guests > 1;

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl mx-auto bg-card border rounded-full shadow-lg p-2 flex flex-col md:flex-row items-center gap-2 transition-all hover:shadow-xl"
    >
      {/* 1. Location Input */}
      <div className="flex-1 w-full flex items-center gap-3 px-4 py-2 hover:bg-muted/50 rounded-full transition cursor-pointer">
        <MapPin className="w-5 h-5 text-[#E9385C] shrink-0" />
        <div className="w-full">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Where
          </label>
          <input
            type="text"
            placeholder="Search destinations (e.g. Mumbai, Paris)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/60 placeholder:font-normal"
          />
        </div>
      </div>

      <div className="hidden md:block h-8 w-px bg-border"></div>

      {/* 2. Dates Picker */}
      <Popover>
        <PopoverTrigger>
          <div className="flex-1 w-full flex items-center gap-3 px-4 py-2 hover:bg-muted/50 rounded-full transition cursor-pointer">
            <CalendarIcon className="w-5 h-5 text-[#E9385C] shrink-0" />
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                When
              </label>
              <div className="text-sm font-semibold text-foreground line-clamp-1">
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                  ) : (
                    format(dateRange.from, "MMM d")
                  )
                ) : (
                  <span className="text-muted-foreground font-normal">Add dates</span>
                )}
              </div>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent align="center" className="w-auto p-4 rounded-2xl shadow-xl">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
            className="rounded-md"
          />
        </PopoverContent>
      </Popover>

      <div className="hidden md:block h-8 w-px bg-border"></div>

      {/* 3. Guests Stepper */}
      <Popover>
        <PopoverTrigger>
          <div className="flex-1 w-full flex items-center gap-3 px-4 py-2 hover:bg-muted/50 rounded-full transition cursor-pointer">
            <Users className="w-5 h-5 text-[#E9385C] shrink-0" />
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Who
              </label>
              <div className="text-sm font-semibold text-foreground">
                {guests === 1 ? "1 guest" : `${guests} guests`}
              </div>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">Guests</div>
              <div className="text-xs text-muted-foreground">Adults, children, infants</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-foreground disabled:opacity-30 transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-sm min-w-5 text-center">{guests}</span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(16, g + 1))}
                disabled={guests >= 16}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-foreground disabled:opacity-30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end pr-1">
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="rounded-full text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}

        <Button
          type="submit"
          className="w-full md:w-auto bg-[#E9385C] hover:bg-[#D02B4C] text-white font-semibold rounded-full px-6 py-6 shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 stroke-[3]" />
          <span className="md:hidden font-bold">Search</span>
        </Button>
      </div>
    </form>
  );
}
