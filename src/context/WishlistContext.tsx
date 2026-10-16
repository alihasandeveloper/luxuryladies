"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WishlistItem } from "@/types/wishlist";
import { toast } from "sonner";

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (id: number) => boolean;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (item: WishlistItem) => boolean; // returns true if added, false if removed
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "luxuryladies_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse wishlist from localStorage", e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [wishlist, isHydrated]);

  const isInWishlist = (id: number): boolean => {
    return wishlist.some((item) => item.id === id);
  };

  const addToWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) return;
    setWishlist((prev) => [item, ...prev]);
    toast.success(`${item.name} added to wishlist!`);
  };

  const removeFromWishlist = (id: number) => {
    const item = wishlist.find((i) => i.id === id);
    setWishlist((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      toast.info(`${item.name} removed from wishlist.`);
    }
  };

  const toggleWishlist = (item: WishlistItem): boolean => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
      return false;
    } else {
      addToWishlist(item);
      return true;
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    toast.info("Wishlist has been cleared.");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
