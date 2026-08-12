"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full min-h-[400px] rounded-2xl" />,
});

export default MapComponent;
