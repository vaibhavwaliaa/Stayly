"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Heart, Star, MapPin, SlidersHorizontal } from "lucide-react";

export default function DesignPreviewPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Stayly Design System Preview
        </h1>
        <p className="text-muted-foreground">
          Airbnb-inspired visual language: warm coral brand color (#E9385C), pill search bar, hover cards, and clean typography.
        </p>
      </div>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Color Palette</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#E9385C] text-white shadow-sm">
            <div className="font-semibold">Brand Primary</div>
            <div className="text-xs opacity-90">#E9385C (Coral)</div>
          </div>
          <div className="p-4 rounded-xl bg-[#222222] text-white shadow-sm">
            <div className="font-semibold">Near Black Text</div>
            <div className="text-xs opacity-90">#222222</div>
          </div>
          <div className="p-4 rounded-xl bg-[#717171] text-white shadow-sm">
            <div className="font-semibold">Muted Text</div>
            <div className="text-xs opacity-90">#717171</div>
          </div>
          <div className="p-4 rounded-xl bg-[#F7F7F7] border text-[#222222] shadow-sm">
            <div className="font-semibold">Secondary Bg</div>
            <div className="text-xs text-muted-foreground">#F7F7F7</div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Buttons & Icons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button className="bg-[#E9385C] hover:bg-[#D02B4C] text-white rounded-lg">
            Primary Button
          </Button>
          <Button variant="outline" className="rounded-lg">
            Outline Button
          </Button>
          <Button variant="ghost" className="rounded-lg">
            Ghost Button
          </Button>
          <Button className="bg-[#E9385C] hover:bg-[#D02B4C] text-white rounded-full px-6">
            Pill Primary
          </Button>
          <button className="p-2.5 rounded-full border hover:shadow-md transition">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          </button>
          <button className="p-2.5 rounded-full border hover:shadow-md transition">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Signature Pill Search Bar */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Pill Search Bar (Navbar)</h2>
        <div className="inline-flex items-center gap-3 px-4 py-2.5 pill-search-bar cursor-pointer bg-white dark:bg-card">
          <span className="font-medium text-sm px-2">Anywhere</span>
          <span className="h-4 w-px bg-border"></span>
          <span className="font-medium text-sm px-2">Any week</span>
          <span className="h-4 w-px bg-border"></span>
          <span className="text-sm text-muted-foreground px-2">Add guests</span>
          <div className="p-2 bg-[#E9385C] text-white rounded-full">
            <Search className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
      </section>

      {/* Listing Card Sample */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Listing Card Style</h2>
        <div className="w-72">
          <div className="card-hover-effect rounded-2xl overflow-hidden border bg-card cursor-pointer">
            <div className="relative aspect-square bg-muted">
              {/* Image Placeholder */}
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
                alt="Sample stay"
                className="w-full h-full object-cover"
              />
              <button className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-xs transition">
                <Heart className="w-4 h-4" />
              </button>
              <Badge className="absolute top-3 left-3 bg-white/90 text-black backdrop-blur-xs hover:bg-white text-xs font-semibold">
                Superhost
              </Badge>
            </div>
            <div className="p-4 space-y-1.5">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-base line-clamp-1">Sun-Drenched Loft in Bandra</h3>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                  <span>4.92</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Mumbai, India
              </p>
              <div className="pt-1 flex items-baseline gap-1">
                <span className="font-bold text-base">₹4,500</span>
                <span className="text-xs text-muted-foreground">/ night</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
