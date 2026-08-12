"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ListingCard as ListingCardType } from "@/lib/types";

// Custom Leaflet Marker Icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapComponentProps {
  listings: ListingCardType[];
  center?: [number, number];
  zoom?: number;
}

export default function MapComponent({
  listings,
  center = [20.5937, 78.9629], // Default center: India
  zoom = 4,
}: MapComponentProps) {
  // If single listing has coordinates
  const validListings = listings.filter((l) => l.cover_photo_url || l.title);

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validListings.map((l) => {
          // Default lat/lng lookup fallback if null
          const lat = (l as any).lat || 19.076;
          const lng = (l as any).lng || 72.8777;

          return (
            <Marker key={l.id} position={[lat, lng]} icon={customIcon}>
              <Popup className="rounded-xl">
                <div className="p-1 max-w-[180px] space-y-1">
                  {l.cover_photo_url && (
                    <img
                      src={l.cover_photo_url}
                      alt={l.title}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  )}
                  <h4 className="font-bold text-xs line-clamp-1">{l.title}</h4>
                  <p className="text-[10px] text-muted-foreground">{l.city}, {l.country}</p>
                  <p className="text-xs font-bold text-[#E9385C]">
                    ₹{Number(l.price_per_night).toLocaleString()}/night
                  </p>
                  <a
                    href={`/listing/${l.id}`}
                    className="block text-[10px] font-semibold text-center py-1 bg-[#E9385C] text-white rounded-md mt-1"
                  >
                    View Listing
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
