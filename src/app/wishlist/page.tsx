import { Metadata } from "next";
import { Suspense } from "react";
import WishlistView from "@/components/WishlistView";

export const metadata: Metadata = {
  title: "My Wishlist | Luxury Ladies",
  description:
    "View and manage your saved luxury heels, bags, and fashion accessories at Luxury Ladies.",
};

export default function WishlistPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WishlistView />
    </Suspense>
  );
}
