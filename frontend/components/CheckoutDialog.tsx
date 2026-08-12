"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";
import type { ListingDetail, Booking } from "@/lib/types";
import { format, differenceInCalendarDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { CreditCard, Lock, Loader2, CheckCircle2 } from "lucide-react";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: ListingDetail;
  dateRange: DateRange;
  guestsCount: number;
}

export default function CheckoutDialog({
  open,
  onOpenChange,
  listing,
  dateRange,
  guestsCount,
}: CheckoutDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Mock Card state
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8892");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("492");

  if (!dateRange.from || !dateRange.to) return null;

  const nights = Math.max(1, differenceInCalendarDays(dateRange.to, dateRange.from));
  const subtotal = nights * listing.price_per_night;
  const cleaningFee = 800; // mocked flat cleaning fee
  const serviceFee = Math.round(subtotal * 0.12); // 12% service fee
  const totalPrice = subtotal + cleaningFee + serviceFee;

  const formattedCheckIn = format(dateRange.from, "yyyy-MM-dd");
  const formattedCheckOut = format(dateRange.to, "yyyy-MM-dd");

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Fake ~1.5s loading delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 2. Call POST /bookings
      const booking = await apiFetch<Booking>("/bookings", {
        method: "POST",
        body: {
          listing_id: listing.id,
          check_in: formattedCheckIn,
          check_out: formattedCheckOut,
          guests_count: guestsCount,
        },
      });

      // On Success
      toast.success("Booking confirmed! Check your trips.", {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      });

      // Invalidate availability so calendar blocks these dates
      queryClient.invalidateQueries({ queryKey: ["availability", listing.id] });
      queryClient.invalidateQueries({ queryKey: ["my-trips"] });

      onOpenChange(false);
      router.push("/trips");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("Those dates were just booked — please pick another date range.");
        queryClient.invalidateQueries({ queryKey: ["availability", listing.id] });
        onOpenChange(false);
      } else if (err instanceof ApiError) {
        toast.error(err.detail || "Failed to confirm booking.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            Confirm and Pay
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review your reservation details and complete checkout.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirmPay} className="space-y-4 pt-2">
          {/* Reservation Summary Box */}
          <div className="p-3.5 rounded-xl bg-muted/60 space-y-2 border">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h4 className="font-semibold text-sm line-clamp-1">{listing.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {listing.city}, {listing.country}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-md bg-background border">
                {nights} {nights === 1 ? "night" : "nights"}
              </span>
            </div>

            <div className="text-xs text-muted-foreground pt-1 flex justify-between border-t border-border/50">
              <span>
                <strong>Dates:</strong> {format(dateRange.from, "MMM d")} -{" "}
                {format(dateRange.to, "MMM d, yyyy")}
              </span>
              <span>
                <strong>Guests:</strong> {guestsCount}
              </span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span>
                ₹{listing.price_per_night.toLocaleString()} × {nights} nights
              </span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cleaning fee</span>
              <span>₹{cleaningFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee (12%)</span>
              <span>₹{serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 border-t text-foreground">
              <span>Total Amount</span>
              <span className="text-[#E9385C]">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Inputs (Mocked) */}
          <div className="space-y-3 pt-2 border-t">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-foreground" /> Payment details (Demo)
            </h4>

            <div className="space-y-1.5">
              <Label htmlFor="cardNum" className="text-xs">Card Number</Label>
              <Input
                id="cardNum"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expiry" className="text-xs">Expiry Date</Label>
                <Input
                  id="expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                  className="rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cvc" className="text-xs">CVC</Label>
                <Input
                  id="cvc"
                  type="password"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  required
                  className="rounded-xl font-mono text-xs"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E9385C] hover:bg-[#D02B4C] text-white font-bold py-3 rounded-xl transition mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Payment...
              </span>
            ) : (
              `Pay ₹${totalPrice.toLocaleString()}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
