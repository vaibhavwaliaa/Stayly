"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Grid, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/lib/types";

interface GalleryProps {
  photos: Photo[];
  title: string;
}

export default function Gallery({ photos, title }: GalleryProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fallbackUrl =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80";

  const displayPhotos = photos.length > 0 ? photos : [{ id: 0, listing_id: 0, url: fallbackUrl, sort_order: 0 }];

  const mainPhoto = displayPhotos[0]?.url || fallbackUrl;
  const sidePhotos = displayPhotos.slice(1, 5);

  const handleOpenModal = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayPhotos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayPhotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Signature Airbnb Gallery Grid */}
      <div className="relative rounded-2xl overflow-hidden border bg-muted group">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-4/3 md:aspect-21/9">
          {/* Main Large Photo */}
          <div
            onClick={() => handleOpenModal(0)}
            className="md:col-span-2 relative cursor-pointer overflow-hidden h-full"
          >
            <img
              src={mainPhoto}
              alt={`${title} main photo`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* 2x2 Right Side Grid */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 h-full">
            {Array.from({ length: 4 }).map((_, i) => {
              const photo = sidePhotos[i];
              const photoUrl = photo?.url || mainPhoto;
              return (
                <div
                  key={i}
                  onClick={() => handleOpenModal(i + 1 < displayPhotos.length ? i + 1 : 0)}
                  className="relative cursor-pointer overflow-hidden h-full bg-muted/60"
                >
                  <img
                    src={photoUrl}
                    alt={`${title} photo ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Show All Photos Button */}
        <Button
          onClick={() => handleOpenModal(0)}
          variant="outline"
          className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-xs text-xs font-semibold rounded-xl gap-2 shadow-md hover:bg-white dark:hover:bg-black border-none"
        >
          <Grid className="w-4 h-4" />
          Show all {displayPhotos.length} photos
        </Button>
      </div>

      {/* Fullscreen Photo Carousel Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 bg-black text-white border-none flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-4 flex items-center justify-between z-10 border-b border-white/10">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {displayPhotos.length}
            </span>
            <span className="text-sm font-semibold truncate max-w-md">{title}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setModalOpen(false)}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Image Display */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            <img
              src={displayPhotos[currentIndex]?.url || fallbackUrl}
              alt={`${title} slide ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />

            {/* Navigation Arrows */}
            {displayPhotos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
