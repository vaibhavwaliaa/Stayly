"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { ListingDetail, AvailabilityRange, Review, Booking } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Gallery from "@/components/Gallery";
import BookingSummary from "@/components/BookingSummary";
import { useStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  Wifi,
  Tv,
  Car,
  Utensils,
  Wind,
  Waves,
  Briefcase,
  KeyRound,
  PawPrint,
  CheckCircle2,
  Calendar,
  Sparkles,
  MessageSquarePlus,
  Loader2,
} from "lucide-react";

// Amenity Icon Mapper
function getAmenityIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("wifi")) return <Wifi className="w-5 h-5 text-emerald-600" />;
  if (lower.includes("kitchen")) return <Utensils className="w-5 h-5 text-amber-600" />;
  if (lower.includes("parking")) return <Car className="w-5 h-5 text-blue-600" />;
  if (lower.includes("pool")) return <Waves className="w-5 h-5 text-cyan-600" />;
  if (lower.includes("air conditioning")) return <Wind className="w-5 h-5 text-sky-600" />;
  if (lower.includes("workspace")) return <Briefcase className="w-5 h-5 text-indigo-600" />;
  if (lower.includes("tv")) return <Tv className="w-5 h-5 text-purple-600" />;
  if (lower.includes("check-in")) return <KeyRound className="w-5 h-5 text-rose-600" />;
  if (lower.includes("pet")) return <PawPrint className="w-5 h-5 text-orange-600" />;
  return <CheckCircle2 className="w-5 h-5 text-muted-foreground" />;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useStore();

  const id = params?.id as string;

  // Review Dialog State (Bonus Feature)
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // 1. Fetch Listing Detail
  const { data: listing, isLoading: loadingListing, isError } = useQuery<ListingDetail>({
    queryKey: ["listing", id],
    queryFn: () => apiFetch<ListingDetail>(`/listings/${id}`),
    enabled: !!id,
  });

  // 2. Fetch Availability Dates
  const { data: availability } = useQuery<AvailabilityRange[]>({
    queryKey: ["availability", id],
    queryFn: () => apiFetch<AvailabilityRange[]>(`/listings/${id}/availability`),
    enabled: !!id,
  });

  // 3. Fetch Listing Reviews
  const { data: reviewsData } = useQuery<{ items: Review[] }>({
    queryKey: ["reviews", id],
    queryFn: () => apiFetch<{ items: Review[] }>(`/listings/${id}/reviews`),
    enabled: !!id,
  });

  // 4. Fetch User Bookings to check if user has completed stay (for Review bonus)
  const { data: userBookings } = useQuery<Booking[]>({
    queryKey: ["my-trips"],
    queryFn: () => apiFetch<Booking[]>("/bookings/me"),
    enabled: !!user,
  });

  const reviews = reviewsData?.items || [];

  // Check if user has a completed booking on this listing
  const completedBooking = userBookings?.find(
    (b) => b.listing_id === Number(id) && b.status === "completed"
  );

  const isSuperhost = (listing?.avg_rating || 0) >= 4.8 && (listing?.review_count || 0) >= 2;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      await apiFetch(`/listings/${id}/reviews`, {
        method: "POST",
        body: {
          rating,
          comment,
          booking_id: completedBooking?.id,
        },
      });

      toast.success("Thank you for your review!");
      setReviewOpen(false);
      setComment("");

      // Refetch listing and reviews
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.detail || "Failed to submit review");
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loadingListing) {
    return (
      <main className="min-h-screen bg-background pb-16">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          <Skeleton className="h-8 w-1/2 rounded-lg" />
          <Skeleton className="h-4 w-1/4 rounded-lg" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  if (isError || !listing) {
    return (
      <main className="min-h-screen bg-background pb-16">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-20 space-y-4">
          <h2 className="text-xl font-bold">Listing not found</h2>
          <p className="text-sm text-muted-foreground">
            The listing you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => router.push("/")} className="bg-[#E9385C] text-white rounded-full">
            Back to Explore
          </Button>
        </div>
      </main>
    );
  }

  const hostSinceYear = listing.host?.host_since
    ? format(parseISO(listing.host.host_since), "yyyy")
    : "2023";

  return (
    <main className="min-h-screen flex flex-col bg-background pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 space-y-8">
        {/* Title & Header Bar */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {listing.avg_rating > 0 && (
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                {listing.avg_rating.toFixed(2)} ·{" "}
                <u className="cursor-pointer">{listing.review_count} reviews</u>
              </span>
            )}
            {isSuperhost && (
              <Badge className="bg-rose-100 text-[#E9385C] dark:bg-rose-950 dark:text-rose-300 border-none font-semibold">
                ★ Superhost
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-foreground" />
              {listing.city}, {listing.country}
            </span>
          </div>
        </div>

        {/* 1. Photo Gallery */}
        <Gallery photos={listing.photos} title={listing.title} />

        {/* 2. Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
          {/* LEFT Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Header Row */}
            <div className="flex items-center justify-between border-b pb-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">
                  {listing.property_type.charAt(0).toUpperCase() + listing.property_type.slice(1)} hosted by{" "}
                  {listing.host?.name || "Host"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds ·{" "}
                  {listing.bathrooms} bathrooms
                </p>
              </div>
              <Avatar className="w-14 h-14 border-2 border-border shadow-xs">
                <AvatarImage src={listing.host?.avatar_url || ""} />
                <AvatarFallback className="bg-[#E9385C] text-white font-bold text-lg">
                  {listing.host?.name?.charAt(0) || "H"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Description */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-bold">About this space</h3>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-bold">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-3 text-sm">
                    {getAmenityIcon(amenity.name)}
                    <span className="font-medium text-foreground">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-current text-yellow-500" />
                  <h3 className="text-xl font-bold">
                    {listing.avg_rating > 0 ? listing.avg_rating.toFixed(2) : "New"} ·{" "}
                    {listing.review_count} {listing.review_count === 1 ? "review" : "reviews"}
                  </h3>
                </div>

                {/* Write Review Button if user completed stay */}
                {completedBooking && (
                  <Button
                    onClick={() => setReviewOpen(true)}
                    variant="outline"
                    className="rounded-full gap-2 text-xs font-semibold border-[#E9385C] text-[#E9385C] hover:bg-[#E9385C]/10"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    Write a review
                  </Button>
                )}
              </div>

              {/* Reviews 2-column Grid */}
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet for this listing.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl border bg-card space-y-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={rev.guest?.avatar_url || ""} />
                          <AvatarFallback className="bg-muted text-xs font-bold">
                            {rev.guest?.name?.charAt(0) || "G"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-sm">{rev.guest?.name || "Guest"}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(parseISO(rev.created_at), "MMMM yyyy")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? "fill-current text-yellow-500"
                                : "text-muted border-none"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-foreground/90 line-clamp-4 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT Column: Sticky Booking Card */}
          <div>
            <BookingSummary listing={listing} availability={availability} />
          </div>
        </div>
      </div>

      {/* Write Review Dialog (Post-Stay Bonus) */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Write a review</DialogTitle>
            <DialogDescription className="text-xs">
              Share your feedback on your completed stay at {listing.title}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-yellow-500 transition hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= rating ? "fill-current text-yellow-500" : "text-muted"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Your Comment</label>
              <Textarea
                rows={4}
                placeholder="Describe your stay, the host, cleanliness, location..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={submittingReview}
              className="w-full bg-[#E9385C] hover:bg-[#D02B4C] text-white font-bold rounded-xl"
            >
              {submittingReview ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </span>
              ) : (
                "Submit Review"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
