"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { ListingDetail, AvailabilityRange } from "@/lib/types";
import DateRangePicker from "./DateRangePicker";
import CheckoutDialog from "./CheckoutDialog";
import AuthDialog from "./AuthDialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Star, Users, Plus, Minus, Calendar as CalendarIcon } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import type { DateRange } from "react-day-picker";

interface BookingSummaryProps {
  listing: ListingDetail;
  availability: AvailabilityRange[] | undefined;
}

export default function BookingSummary({
  listing,
  availability,
}: BookingSummaryProps) {
  const { user } = useStore();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guestsCount, setGuestsCount] = useState<number>(1);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const nights =
    dateRange?.from && dateRange?.to
      ? Math.max(1, differenceInCalendarDays(dateRange.to, dateRange.from))
      : 0;

  const subtotal = nights * listing.price_per_night;
  const cleaningFee = nights > 0 ? 800 : 0;
  const serviceFee = nights > 0 ? Math.round(subtotal * 0.12) : 0;
  const totalPrice = subtotal + cleaningFee + serviceFee;

  const handleReserveClick = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!dateRange?.from || !dateRange?.to) return;
    setCheckoutOpen(true);
  };

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(listing.price_per_night);

  return (
    <>
      <div className="sticky top-24 p-6 rounded-2xl border bg-card shadow-xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-2xl font-bold text-foreground">{formattedPrice}</span>
            <span className="text-sm text-muted-foreground"> / night</span>
          </div>
          {listing.avg_rating > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
              <span>{listing.avg_rating.toFixed(2)}</span>
              <span className="text-muted-foreground">({listing.review_count})</span>
            </div>
          )}
        </div>

        {/* Date & Guests Selection Box */}
        <div className="border rounded-2xl overflow-hidden divide-y">
          {/* Dates Trigger */}
          <Popover>
            <PopoverTrigger>
              <div className="p-3 hover:bg-muted/50 transition cursor-pointer">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Dates
                </label>
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#E9385C]" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span className="text-muted-foreground font-normal">Select check-in & check-out</span>
                  )}
                </div>
              </div>
            </PopoverTrigger>

            <PopoverContent align="center" className="w-auto p-2 rounded-2xl shadow-xl">
              <DateRangePicker
                dateRange={dateRange}
                onSelect={setDateRange}
                availability={availability}
              />
            </PopoverContent>
          </Popover>

          {/* Guests Trigger */}
          <Popover>
            <PopoverTrigger>
              <div className="p-3 hover:bg-muted/50 transition cursor-pointer">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Guests
                </label>
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-[#E9385C]" />
                  {guestsCount === 1 ? "1 guest" : `${guestsCount} guests`}{" "}
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (max {listing.max_guests})
                  </span>
                </div>
              </div>
            </PopoverTrigger>

            <PopoverContent align="center" className="w-64 p-4 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs">Guests</div>
                  <div className="text-[10px] text-muted-foreground">
                    Max limit: {listing.max_guests}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestsCount((g) => Math.max(1, g - 1))}
                    disabled={guestsCount <= 1}
                    className="w-7 h-7 rounded-full border flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-xs w-4 text-center">{guestsCount}</span>
                  <button
                    type="button"
                    onClick={() => setGuestsCount((g) => Math.min(listing.max_guests, g + 1))}
                    disabled={guestsCount >= listing.max_guests}
                    className="w-7 h-7 rounded-full border flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Reserve Action Button */}
        <Button
          onClick={handleReserveClick}
          disabled={!dateRange?.from || !dateRange?.to}
          className="w-full bg-[#E9385C] hover:bg-[#D02B4C] text-white font-bold py-3.5 rounded-xl transition shadow-md hover:scale-[1.02] disabled:opacity-50"
        >
          {dateRange?.from && dateRange?.to ? "Reserve" : "Select Available Dates"}
        </Button>

        {/* Price Breakdown (only visible when dates are selected) */}
        {nights > 0 && (
          <div className="space-y-2 pt-4 border-t text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>
                ₹{listing.price_per_night.toLocaleString()} × {nights} {nights === 1 ? "night" : "nights"}
              </span>
              <span className="font-medium text-foreground">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Cleaning fee</span>
              <span className="font-medium text-foreground">₹{cleaningFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Service fee (12%)</span>
              <span className="font-medium text-foreground">₹{serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-3 border-t text-foreground">
              <span>Total before taxes</span>
              <span className="text-[#E9385C]">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {dateRange?.from && dateRange?.to && (
        <CheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          listing={listing}
          dateRange={dateRange}
          guestsCount={guestsCount}
        />
      )}

      {/* Auth Modal if user is not logged in */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode="login" />
    </>
  );
}
