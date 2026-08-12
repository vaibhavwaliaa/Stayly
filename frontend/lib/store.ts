/**
 * Stayly Global State Store (Zustand)
 *
 * Holds: current user, auth token, and wishlist set.
 * Persisted to localStorage so auth survives page refreshes.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";

interface StaylyState {
  // Auth
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;

  // Wishlist — a Set of listing IDs for instant lookup
  wishlistIds: number[];
  addToWishlist: (listingId: number) => void;
  removeFromWishlist: (listingId: number) => void;
  setWishlist: (ids: number[]) => void;
  isWishlisted: (listingId: number) => boolean;
}

export const useStore = create<StaylyState>()(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────────────────
      user: null,
      token: null,

      setAuth: (user, token) => set({ user, token }),

      clearAuth: () => set({ user: null, token: null, wishlistIds: [] }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // ── Wishlist ──────────────────────────────────────────────────────
      wishlistIds: [],

      addToWishlist: (listingId) =>
        set((state) => ({
          wishlistIds: state.wishlistIds.includes(listingId)
            ? state.wishlistIds
            : [...state.wishlistIds, listingId],
        })),

      removeFromWishlist: (listingId) =>
        set((state) => ({
          wishlistIds: state.wishlistIds.filter((id) => id !== listingId),
        })),

      setWishlist: (ids) => set({ wishlistIds: ids }),

      isWishlisted: (listingId) => get().wishlistIds.includes(listingId),
    }),
    {
      name: "stayly-store", // localStorage key — also read by api.ts getToken()
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        wishlistIds: state.wishlistIds,
      }),
    }
  )
);
