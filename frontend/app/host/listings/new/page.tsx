"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import ListingForm from "@/components/ListingForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NewListingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleCreateSubmit = async (formData: any) => {
    await apiFetch("/listings", {
      method: "POST",
      body: formData,
    });

    toast.success("Listing created successfully!");
    queryClient.invalidateQueries({ queryKey: ["host-listings"] });
    queryClient.invalidateQueries({ queryKey: ["listings"] });
    router.push("/host");
  };

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
            <h1 className="text-2xl font-bold tracking-tight">Create a New Listing</h1>
            <p className="text-xs text-muted-foreground">
              Fill in the details to publish your property on Stayly.
            </p>
          </div>
        </div>

        <ListingForm onSubmit={handleCreateSubmit} submitLabel="Publish Listing" />
      </div>
    </main>
  );
}
