"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { Amenity, ListingDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ListingFormProps {
  initialData?: ListingDetail;
  onSubmit: (data: any) => Promise<void>;
  submitLabel: string;
}

export default function ListingForm({
  initialData,
  onSubmit,
  submitLabel,
}: ListingFormProps) {
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [propertyType, setPropertyType] = useState(initialData?.property_type || "apartment");
  const [city, setCity] = useState(initialData?.city || "");
  const [country, setCountry] = useState(initialData?.country || "");
  const [pricePerNight, setPricePerNight] = useState(initialData?.price_per_night?.toString() || "");
  const [maxGuests, setMaxGuests] = useState(initialData?.max_guests?.toString() || "2");
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms?.toString() || "1");
  const [beds, setBeds] = useState(initialData?.beds?.toString() || "1");
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms?.toString() || "1");

  // Amenities
  const { data: availableAmenities } = useQuery<Amenity[]>({
    queryKey: ["amenities"],
    queryFn: () => apiFetch<Amenity[]>("/amenities"),
  });

  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>(
    initialData?.amenities?.map((a) => a.id) || []
  );

  // Repeatable Photo URLs
  const [photoUrls, setPhotoUrls] = useState<string[]>(
    initialData?.photos?.map((p) => p.url) || [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
    ]
  );

  const handleAddPhoto = () => {
    setPhotoUrls((prev) => [...prev, ""]);
  };

  const handleRemovePhoto = (index: number) => {
    if (photoUrls.length <= 1) {
      toast.error("At least one photo URL is required.");
      return;
    }
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhotoChange = (index: number, value: string) => {
    setPhotoUrls((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleAmenityToggle = (id: number) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const cleanPhotos = photoUrls.map((u) => u.trim()).filter(Boolean);
    if (cleanPhotos.length === 0) {
      toast.error("At least one valid photo URL is required.");
      return;
    }

    if (selectedAmenityIds.length === 0) {
      toast.error("Please select at least one amenity.");
      return;
    }

    const priceNum = parseFloat(pricePerNight);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price per night greater than 0.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        property_type: propertyType,
        city,
        country,
        price_per_night: priceNum,
        max_guests: parseInt(maxGuests, 10),
        bedrooms: parseInt(bedrooms, 10),
        beds: parseInt(beds, 10),
        bathrooms: parseInt(bathrooms, 10),
        amenity_ids: selectedAmenityIds,
        photo_urls: cleanPhotos,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.detail || "Failed to save listing.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-8 max-w-3xl bg-card border p-8 rounded-3xl shadow-sm">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">Listing Basics</h3>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g. Sun-Drenched Studio in Bandra"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Describe what makes your space unique, location highlights, and guest access..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Property Type</Label>
            <Select value={propertyType} onValueChange={(val) => setPropertyType(val || "apartment")}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="cabin">Cabin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="e.g. India"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Capacity */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-bold border-b pb-2">Pricing & Capacity</h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="price">Price Per Night (₹)</Label>
            <Input
              id="price"
              type="number"
              placeholder="3500"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              required
              min={1}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxGuests">Max Guests</Label>
            <Input
              id="maxGuests"
              type="number"
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              required
              min={1}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              required
              min={0}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              required
              min={0}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-bold border-b pb-2">Amenities</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableAmenities?.map((amenity) => {
            const checked = selectedAmenityIds.includes(amenity.id);
            return (
              <div
                key={amenity.id}
                onClick={() => handleAmenityToggle(amenity.id)}
                className="flex items-center space-x-2.5 cursor-pointer hover:opacity-80 p-2 rounded-xl border bg-background"
              >
                <Checkbox id={`form-amenity-${amenity.id}`} checked={checked} />
                <label
                  htmlFor={`form-amenity-${amenity.id}`}
                  className="text-xs font-medium cursor-pointer"
                >
                  {amenity.name}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Repeatable Photo URLs */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-bold">Photos (Unsplash URLs)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPhoto}
            className="rounded-full text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add photo URL
          </Button>
        </div>

        <div className="space-y-3">
          {photoUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-3">
              {/* Live Thumbnail Preview */}
              <div className="w-14 h-14 rounded-xl border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                {url.trim() ? (
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <Input
                placeholder="https://images.unsplash.com/photo-..."
                value={url}
                onChange={(e) => handlePhotoChange(index, e.target.value)}
                required
                className="rounded-xl font-mono text-xs flex-1"
              />

              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="p-2 text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E9385C] hover:bg-[#D02B4C] text-white font-bold py-3.5 rounded-xl shadow-md"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
