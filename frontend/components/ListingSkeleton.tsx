"use client";

export default function ListingSkeleton() {
  return (
    <div className="space-y-3 animate-shimmer">
      {/* Square image aspect ratio matching ListingCard */}
      <div className="aspect-square w-full rounded-2xl bg-[#EBEBEB]" />
      
      {/* Row 1: Title + rating placeholder */}
      <div className="flex justify-between items-center gap-2">
        <div className="h-4 w-3/4 rounded-md bg-[#EBEBEB]" />
        <div className="h-4 w-10 rounded-md bg-[#EBEBEB]" />
      </div>

      {/* Row 2: Location placeholder */}
      <div className="h-3 w-1/2 rounded-md bg-[#EBEBEB]" />

      {/* Row 3: Price placeholder */}
      <div className="h-4 w-1/3 rounded-md bg-[#EBEBEB]" />
    </div>
  );
}
