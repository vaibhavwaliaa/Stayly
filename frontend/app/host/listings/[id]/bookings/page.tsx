"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Booking } from "@/lib/types";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Users, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function HostListingBookingsPage() {
  const params = useParams();
  const router = useRouter();

  const listingId = params?.id as string;

  const { data: bookings, isLoading, isError } = useQuery<Booking[]>({
    queryKey: ["host-listing-bookings", listingId],
    queryFn: () => apiFetch<Booking[]>(`/listings/${listingId}/bookings`),
    enabled: !!listingId,
  });

  return (
    <main className="min-h-screen flex flex-col bg-background pb-16">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-6 flex-1">
        <div className="flex items-center gap-4 border-b pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/host")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Listing Bookings</h1>
            <p className="text-xs text-muted-foreground">
              All reservations for Listing #{listingId}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-destructive font-semibold">Failed to load listing bookings.</p>
          </div>
        ) : (bookings || []).length === 0 ? (
          <div className="text-center py-16 border rounded-3xl bg-card space-y-3 max-w-md mx-auto">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-bold">No bookings for this property yet</h3>
            <p className="text-xs text-muted-foreground">
              Future guest reservations will show up here.
            </p>
          </div>
        ) : (
          <div className="border rounded-2xl overflow-hidden bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted border-b uppercase text-[10px] tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Guest ID</th>
                    <th className="p-3.5">Check In - Check Out</th>
                    <th className="p-3.5">Guests</th>
                    <th className="p-3.5">Total Price</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings?.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/40 transition">
                      <td className="p-3.5 font-bold">#{b.id}</td>
                      <td className="p-3.5">User #{b.guest_id}</td>
                      <td className="p-3.5 font-medium">
                        {format(parseISO(b.check_in), "MMM d, yyyy")} -{" "}
                        {format(parseISO(b.check_out), "MMM d, yyyy")}
                      </td>
                      <td className="p-3.5">{b.guests_count}</td>
                      <td className="p-3.5 font-bold text-[#E9385C]">
                        ₹{Number(b.total_price).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        {b.status === "confirmed" && (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none">
                            Confirmed
                          </Badge>
                        )}
                        {b.status === "completed" && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-none">
                            Completed
                          </Badge>
                        )}
                        {b.status === "cancelled" && (
                          <Badge variant="outline" className="text-muted-foreground line-through">
                            Cancelled
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
