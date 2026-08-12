"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Amenity } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FilterSheet({ open, onOpenChange }: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch amenities list
  const { data: amenities } = useQuery<Amenity[]>({
    queryKey: ["amenities"],
    queryFn: () => apiFetch<Amenity[]>("/amenities"),
  });

  // Local filter states initialized from URL
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("property_type") || "");
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(() => {
    const raw = searchParams.getAll("amenities");
    return raw.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
  });

  // Sync state when drawer opens or searchParams change
  useEffect(() => {
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setPropertyType(searchParams.get("property_type") || "");
    const raw = searchParams.getAll("amenities");
    setSelectedAmenities(raw.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)));
  }, [searchParams, open]);

  const handleAmenityToggle = (amenityId: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) params.set("min_price", minPrice);
    else params.delete("min_price");

    if (maxPrice) params.set("max_price", maxPrice);
    else params.delete("max_price");

    if (propertyType) params.set("property_type", propertyType);
    else params.delete("property_type");

    params.delete("amenities");
    selectedAmenities.forEach((id) => params.append("amenities", id.toString()));

    // Reset page to 1
    params.set("page", "1");

    router.push(`/?${params.toString()}`);
    onOpenChange(false);
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("");
    setSelectedAmenities([]);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("min_price");
    params.delete("max_price");
    params.delete("property_type");
    params.delete("amenities");

    router.push(`/?${params.toString()}`);
    onOpenChange(false);
  };

  const propertyTypes = [
    { label: "All Types", value: "" },
    { label: "Apartment", value: "apartment" },
    { label: "House", value: "house" },
    { label: "Villa", value: "villa" },
    { label: "Cabin", value: "cabin" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-6 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-6">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[#E9385C]" />
              Filters
            </SheetTitle>
            <SheetDescription className="text-xs">
              Refine your listing search results by price, type, and amenities.
            </SheetDescription>
          </SheetHeader>

          {/* 1. Price Range */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Price Range (per night)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
                  Minimum (₹)
                </Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                  Maximum (₹)
                </Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="30000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>
          </div>

          {/* 2. Property Type */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-sm">Property Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPropertyType(type.value)}
                  className={`p-3 rounded-xl border text-sm font-medium text-center transition ${
                    propertyType === type.value
                      ? "border-[#E9385C] bg-[#E9385C]/10 text-[#E9385C] font-semibold"
                      : "hover:bg-muted"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Amenities */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-sm">Amenities</h4>
            <div className="grid grid-cols-2 gap-3">
              {amenities?.map((amenity) => {
                const checked = selectedAmenities.includes(amenity.id);
                return (
                  <div
                    key={amenity.id}
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className="flex items-center space-x-2.5 cursor-pointer hover:opacity-80"
                  >
                    <Checkbox id={`amenity-${amenity.id}`} checked={checked} />
                    <label
                      htmlFor={`amenity-${amenity.id}`}
                      className="text-xs font-medium cursor-pointer"
                    >
                      {amenity.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t pt-4 mt-6 flex flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 rounded-xl text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-[#E9385C] hover:bg-[#D02B4C] text-white rounded-xl text-xs font-semibold"
          >
            Show results
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
