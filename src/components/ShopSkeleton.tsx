import React from "react";

export default function ShopSkeleton() {
  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen py-6 md:py-10">
      <div className="container mx-auto">
        {/* ── Top Bar Skeleton ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 animate-pulse">
          <div>
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-10 bg-gray-200 rounded-xs" />
              <span className="text-gray-300 text-xs">/</span>
              <div className="h-3 w-12 bg-gray-200 rounded-xs" />
            </div>
            {/* Title Skeleton */}
            <div className="h-7 w-40 bg-gray-300 rounded-xs" />
          </div>

          {/* Sort & Filter Controls Skeleton */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button Skeleton */}
            <div className="md:hidden h-9 w-24 bg-gray-200 rounded-md" />
            {/* Sort Dropdown Skeleton */}
            <div className="h-9 w-36 md:w-44 bg-gray-200 rounded-md" />
          </div>
        </div>

        {/* ── Main Layout: Sidebar + Product Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* ── Desktop Sidebar Filter Skeleton (Identical bg, padding, and box-shadow to ShopArchive) ── */}
          <aside className="hidden md:block md:col-span-1 lg:col-span-3 bg-white p-5 shadow-xs sticky top-28">
            <div className="flex flex-col space-y-6 animate-pulse">
              {/* Filter Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="h-5 w-16 bg-gray-300 rounded-xs" />
                <div className="h-4 w-14 bg-gray-200 rounded-xs" />
              </div>

              {/* Price Range Skeleton */}
              <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-300 rounded-xs" />
                <div className="h-1.5 w-full bg-gray-200 rounded-full my-3" />
                <div className="flex items-center justify-between gap-2">
                  <div className="h-7 w-20 bg-gray-100 rounded-md" />
                  <div className="h-7 w-20 bg-gray-100 rounded-md" />
                </div>
              </div>

              {/* Free Delivery Skeleton */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-xs bg-gray-200" />
                <div className="h-3.5 w-24 bg-gray-200 rounded-xs" />
              </div>

              {/* Offers Filter Skeleton */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="h-4 w-16 bg-gray-300 rounded-xs mb-3" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-0.5">
                    <div className="w-4 h-4 rounded-xs bg-gray-200" />
                    <div
                      className="h-3.5 bg-gray-200 rounded-xs"
                      style={{ width: `${80 + (i * 12) % 30}px` }}
                    />
                  </div>
                ))}
              </div>

              {/* Categories Skeleton */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="h-4 w-20 bg-gray-300 rounded-xs mb-3" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-xs bg-gray-200" />
                      <div
                        className="h-3.5 bg-gray-200 rounded-xs"
                        style={{ width: `${65 + (i * 15) % 40}px` }}
                      />
                    </div>
                    <div className="h-3 w-5 bg-gray-100 rounded-xs" />
                  </div>
                ))}
              </div>

              {/* Stock Status Skeleton */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="h-4 w-24 bg-gray-300 rounded-xs mb-3" />
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-0.5">
                    <div className="w-4 h-4 rounded-xs bg-gray-200" />
                    <div className="h-3.5 w-20 bg-gray-200 rounded-xs" />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Product Grid Area Skeleton (Right 9 cols) ── */}
          <main className="col-span-1 md:col-span-3 lg:col-span-9">
            {/* Result Count Bar Skeleton */}
            <div className="flex items-center justify-between mb-4 animate-pulse">
              <div className="h-4 w-36 bg-gray-200 rounded-xs" />
            </div>

            {/* Grid of Product Cards Skeleton (8 cards) - exactly matching ProductCard.tsx */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-white overflow-hidden md:shadow-lg flex flex-col"
                >
                  <div className="animate-pulse flex flex-col w-full">
                    {/* Product Image Frame (square, sharp, no border) */}
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-200" />

                    {/* Product Info below image */}
                    <div className="p-3 flex flex-col items-start text-left w-full">
                      {/* Product Name */}
                      <div className="h-3.5 w-4/5 bg-gray-200 rounded-xs mb-2" />

                      {/* Pricing Row with Cart Button */}
                      <div className="mt-2 flex items-center justify-between w-full">
                        {/* Price Stack: Current price above, regular below */}
                        <div className="flex flex-col gap-1.5">
                          <div className="h-4 w-16 bg-gray-300 rounded-xs" />
                          <div className="h-2.5 w-12 bg-gray-100 rounded-xs" />
                        </div>

                        {/* Add to Cart Round Button */}
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-200 shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
