"use client";

/**
 * Providers Component
 *
 * Wraps the app with:
 * - React Query's QueryClientProvider for data fetching
 * - next-themes ThemeProvider for dark mode
 * - Sonner Toaster for toast notifications
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside the component to avoid shared state between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
