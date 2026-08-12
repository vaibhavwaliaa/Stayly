"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { ListingCard } from "@/lib/types";
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
import { Plus, Edit, Trash2, Calendar, Home, MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface HostListingItem extends ListingCard {
  is_active: boolean;
  booking_count?: number;
}

export default function HostDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useStore();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check host status
  useEffect(() => {
    if (!user) {
      toast.info("Please log in to access host dashboard");
      router.push("/");
    } else if (!user.is_host) {
      toast.info("Switching your account to Host status...");
      // Auto enable host status if user visits /host
      apiFetch("/auth/me", {
        method: "PATCH",
        body: { is_host: true },
      })
        .then(() => {
          toast.success("Host account activated!");
          queryClient.invalidateQueries({ queryKey: ["user"] });
        })
        .catch(() => {
          router.push("/");
        });
    }
  }, [user, router, queryClient]);

  const { data: listings, isLoading, isError } = useQuery<HostListingItem[]>({
    queryKey: ["host-listings"],
    queryFn: () => apiFetch<HostListingItem[]>("/host/listings"),
    enabled: !!user,
  });

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await apiFetch(`/listings/${deleteId}`, {
        method: "DELETE",
      });

      toast.success("Listing deleted successfully.");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["host-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.detail || "Failed to delete listing.");
      } else {
        toast.error("Failed to delete listing.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const defaultPhoto =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80";

  return (
    <main className="min-h-screen flex flex-col bg-background pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-8 flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Home className="w-7 h-7 text-[#E9385C]" />
              Host Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your property listings and reservations.
            </p>
          </div>

          <Button
            onClick={() => router.push("/host/listings/new")}
            className="bg-[#E9385C] hover:bg-[#D02B4C] text-white rounded-full font-semibold gap-2 shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Listing
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-destructive font-semibold">Failed to load host listings.</p>
          </div>
        ) : (listings || []).length === 0 ? (
          <div className="text-center py-20 border rounded-3xl bg-card space-y-4 max-w-md mx-auto">
            <div className="p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center text-muted-foreground">
              <Home className="w-8 h-8 text-[#E9385C]" />
            </div>
            <h3 className="text-xl font-bold">You don't have any listings yet</h3>
            <p className="text-sm text-muted-foreground">
              Earn income and share your space by creating your first listing.
            </p>
            <Button
              onClick={() => router.push("/host/listings/new")}
              className="bg-[#E9385C] hover:bg-[#D02B4C] text-white rounded-full font-semibold px-6"
            >
              Create Listing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {listings?.map((listing) => (
              <div
                key={listing.id}
                className="p-4 rounded-2xl border bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={listing.cover_photo_url || defaultPhoto}
                    alt={listing.title}
                    className="w-24 h-20 object-cover rounded-xl shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/listing/${listing.id}`}
                        className="font-bold text-base hover:text-[#E9385C] transition line-clamp-1"
                      >
                        {listing.title}
                      </Link>
                      {listing.is_active ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none font-semibold text-[10px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {listing.city}, {listing.country} · ₹{Number(listing.price_per_night).toLocaleString()}/night
                    </p>

                    <div className="text-xs text-muted-foreground">
                      ★ {listing.avg_rating > 0 ? listing.avg_rating.toFixed(2) : "New"} ({listing.review_count} reviews)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/host/listings/${listing.id}/bookings`)}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    Bookings
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/host/listings/${listing.id}/edit`)}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(listing.id)}
                    className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Soft Delete Confirm Modal */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Delete Listing
            </DialogTitle>
            <DialogDescription className="text-xs">
              This will deactivate your listing from search results. Past bookings and reviews will remain saved.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="rounded-xl text-xs flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="rounded-xl text-xs flex-1 font-semibold"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                </span>
              ) : (
                "Deactivate Listing"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
