"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ListingDetail } from "@/lib/types";
import Navbar from "@/components/Navbar";
import ListingForm from "@/components/ListingForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const id = params?.id as string;

  const { data: listing, isLoading, isError } = useQuery<ListingDetail>({
    queryKey: ["listing", id],
    queryFn: () => apiFetch<ListingDetail>(`/listings/${id}`),
    enabled: !!id,
  });

  const handleEditSubmit = async (formData: any) => {
    await apiFetch(`/listings/${id}`, {
      method: "PUT",
      body: formData,
    });

    toast.success("Listing updated successfully!");
    queryClient.invalidateQueries({ queryKey: ["listing", id] });
    queryClient.invalidateQueries({ queryKey: ["host-listings"] });
    queryClient.invalidateQueries({ queryKey: ["listings"] });
    router.push("/host");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background pb-16">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </main>
    );
  }

  if (isError || !listing) {
    return (
      <main className="min-h-screen bg-background pb-16">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-20 space-y-4">
          <p className="text-destructive font-semibold">Listing not found.</p>
          <Button onClick={() => router.push("/host")} className="rounded-full">
            Back to Dashboard
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-background pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-6 flex-1">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/host")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Listing</h1>
            <p className="text-xs text-muted-foreground">
              Update pricing, description, photos, or amenities for {listing.title}.
            </p>
          </div>
        </div>

        <ListingForm
          initialData={listing}
          onSubmit={handleEditSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </main>
  );
}
