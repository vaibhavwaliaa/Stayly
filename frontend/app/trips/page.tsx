"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import { Compass, Calendar, MapPin, AlertTriangle, Loader2 } from "lucide-react";

export default function MyTripsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useStore();

  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.info("Please log in to view your trips");
      router.push("/");
    }
  }, [user, router]);

  const { data: bookings, isLoading, isError } = useQuery<Booking[]>({
    queryKey: ["my-trips"],
    queryFn: () => apiFetch<Booking[]>("/bookings/me"),
    enabled: !!user,
  });

  const today = startOfDay(new Date());

  // Split into Upcoming and Past
  const upcomingBookings =
    bookings?.filter((b) => {
      const checkInDate = parseISO(b.check_in);
      return (
        b.status === "confirmed" && (isAfter(checkInDate, today) || checkInDate.getTime() === today.getTime())
      );
    }) || [];

  const pastBookings =
    bookings?.filter((b) => {
      const checkInDate = parseISO(b.check_in);
      return (
        b.status !== "confirmed" || isBefore(checkInDate, today)
      );
    }) || [];

  const handleCancelConfirm = async () => {
    if (!cancelBookingId) return;

    setCancelling(true);
    try {
      await apiFetch(`/bookings/${cancelBookingId}/cancel`, {
        method: "PATCH",
      });

      toast.success("Booking cancelled successfully.");
      setCancelBookingId(null);
      queryClient.invalidateQueries({ queryKey: ["my-trips"] });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.detail || "Failed to cancel booking.");
      } else {
        toast.error("Failed to cancel booking.");
      }
    } finally {
      setCancelling(false);
    }
  };

  const defaultPhoto =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80";

  return (
    <main className="min-h-screen flex flex-col bg-background pb-16">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-8 flex-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Trips</h1>
          <p className="text-sm text-muted-foreground">
            Manage your upcoming reservations and view past stays.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-destructive font-semibold">Failed to load your trips.</p>
          </div>
        ) : (bookings || []).length === 0 ? (
          <div className="text-center py-20 border rounded-3xl bg-card space-y-4 max-w-md mx-auto">
            <div className="p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center text-muted-foreground">
              <Compass className="w-8 h-8 text-[#E9385C]" />
            </div>
            <h3 className="text-xl font-bold">No trips booked... yet!</h3>
            <p className="text-sm text-muted-foreground">
              Time to dust off your bags and start planning your next adventure.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-[#E9385C] hover:bg-[#D02B4C] text-white rounded-full font-semibold px-6"
            >
              Explore Stays
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Upcoming Trips Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#E9385C]" />
                Upcoming Trips ({upcomingBookings.length})
              </h2>

              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-2">
                  No upcoming reservations.
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl border bg-card flex flex-col sm:flex-row items-center gap-4 shadow-xs hover:shadow-md transition"
                    >
                      <img
                        src={b.listing?.cover_photo_url || defaultPhoto}
                        alt={b.listing?.title || "Listing"}
                        className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0"
                      />

                      <div className="flex-1 space-y-1.5 w-full">
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/listing/${b.listing_id}`}
                            className="font-bold text-base hover:text-[#E9385C] transition line-clamp-1"
                          >
                            {b.listing?.title || "Stay Reservation"}
                          </Link>
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none font-semibold">
                            Confirmed
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {b.listing?.city}
                        </p>

                        <div className="text-xs font-semibold text-foreground pt-1">
                          {format(parseISO(b.check_in), "MMM d, yyyy")} -{" "}
                          {format(parseISO(b.check_out), "MMM d, yyyy")} · {b.guests_count}{" "}
                          {b.guests_count === 1 ? "guest" : "guests"}
                        </div>

                        <div className="text-sm font-bold text-[#E9385C]">
                          ₹{Number(b.total_price).toLocaleString()}
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto flex sm:flex-col justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancelBookingId(b.id)}
                          className="w-full text-xs text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                          Cancel Booking
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past & Cancelled Trips Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2 text-muted-foreground">
                Past & Cancelled Stays ({pastBookings.length})
              </h2>

              {pastBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-2">
                  No past bookings.
                </p>
              ) : (
                <div className="space-y-4 opacity-90">
                  {pastBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl border bg-card flex flex-col sm:flex-row items-center gap-4"
                    >
                      <img
                        src={b.listing?.cover_photo_url || defaultPhoto}
                        alt={b.listing?.title || "Listing"}
                        className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0 grayscale-[20%]"
                      />

                      <div className="flex-1 space-y-1.5 w-full">
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/listing/${b.listing_id}`}
                            className="font-bold text-base hover:text-[#E9385C] transition line-clamp-1"
                          >
                            {b.listing?.title || "Stay Reservation"}
                          </Link>
                          {b.status === "cancelled" ? (
                            <Badge variant="outline" className="text-muted-foreground line-through">
                              Cancelled
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-none font-semibold">
                              Completed
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {b.listing?.city}
                        </p>

                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(b.check_in), "MMM d, yyyy")} -{" "}
                          {format(parseISO(b.check_out), "MMM d, yyyy")}
                        </div>

                        <div className="text-sm font-semibold text-muted-foreground">
                          ₹{Number(b.total_price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Confirm Cancellation Dialog */}
      <Dialog open={!!cancelBookingId} onOpenChange={() => setCancelBookingId(null)}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Confirm Cancellation
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to cancel this reservation? The dates will be freed up for other guests.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setCancelBookingId(null)}
              className="rounded-xl text-xs flex-1"
            >
              Keep Reservation
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelling}
              className="rounded-xl text-xs flex-1 font-semibold"
            >
              {cancelling ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cancelling...
                </span>
              ) : (
                "Yes, Cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
