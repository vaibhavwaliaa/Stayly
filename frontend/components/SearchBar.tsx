"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, Minus } from "lucide-react";
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
      className="w-full max-w-[850px] mx-auto bg-card border border-[#DDDDDD] rounded-full shadow-[0_3px_12px_rgba(0,0,0,0.08)] p-2 flex flex-col md:flex-row items-center transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
    >
      {/* 1. Where Zone (takes ~38% width) */}
      <div className="flex-[1.3] w-full flex items-center gap-2 px-6 py-2.5 hover:bg-[#EBEBEB] dark:hover:bg-muted rounded-full transition cursor-pointer group">
        <div className="w-full">
          <label className="block text-[12px] font-bold tracking-tight text-[#222222]">
            Where
          </label>
          <input
            type="text"
            placeholder="Search destinations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-[14px] font-normal text-[#222222] focus:outline-none placeholder:text-[#717171]"
          />
        </div>
      </div>

      <div className="hidden md:block h-8 w-px bg-[#DDDDDD] shrink-0"></div>

      {/* 2. When Zone (takes ~31% width) */}
      <Popover>
        <PopoverTrigger className="flex-1 w-full">
          <div className="w-full flex items-center gap-2 px-6 py-2.5 hover:bg-[#EBEBEB] dark:hover:bg-muted rounded-full transition cursor-pointer text-left">
            <div>
              <label className="block text-[12px] font-bold tracking-tight text-[#222222]">
                When
              </label>
              <div className="text-[14px] font-normal text-[#222222] line-clamp-1">
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                  ) : (
                    format(dateRange.from, "MMM d")
                  )
                ) : (
                  <span className="text-[#717171]">Add dates</span>
                )}
              </div>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent align="center" className="w-auto p-4 rounded-3xl shadow-2xl border-[#DDDDDD]">
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

      <div className="hidden md:block h-8 w-px bg-[#DDDDDD] shrink-0"></div>

      {/* 3. Who Zone (takes ~31% width) */}
      <Popover>
        <PopoverTrigger className="flex-1 w-full">
          <div className="w-full flex items-center gap-2 px-6 py-2.5 hover:bg-[#EBEBEB] dark:hover:bg-muted rounded-full transition cursor-pointer text-left">
            <div>
              <label className="block text-[12px] font-bold tracking-tight text-[#222222]">
                Who
              </label>
              <div className="text-[14px] font-normal text-[#222222]">
                {guests === 1 ? (
                  <span className="text-[#717171]">Add guests</span>
                ) : (
                  `${guests} guests`
                )}
              </div>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 p-4 rounded-3xl shadow-2xl border-[#DDDDDD]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-[#222222]">Guests</div>
              <div className="text-xs text-[#717171]">Adults, children, infants</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] disabled:opacity-30 transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-sm min-w-5 text-center">{guests}</span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(16, g + 1))}
                disabled={guests >= 16}
                className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] disabled:opacity-30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Action Search Button */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end pr-1 py-0.5">
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="rounded-full text-xs text-[#717171] hover:text-[#222222]"
          >
            Clear
          </Button>
        )}

        <Button
          type="submit"
          className="w-full md:w-auto bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold rounded-full p-3.5 md:p-4 shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 stroke-[3]" />
          <span className="md:hidden font-bold text-sm">Search</span>
        </Button>
      </div>
    </form>
  );
}
