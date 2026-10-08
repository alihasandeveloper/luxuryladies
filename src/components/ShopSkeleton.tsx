import React from "react";

export default function ShopSkeleton() {
  return (
    <div className="w-full bg-white min-h-screen py-6 md:py-10 animate-pulse">
      <div className="container mx-auto">
        {/* ── Top Bar Skeleton ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div>
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-10 bg-gray-200 rounded" />
              <span className="text-gray-300 text-xs">/</span>
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
            {/* Title Skeleton */}
            <div className="h-7 w-40 bg-gray-300 rounded-md" />
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
          {/* ── Desktop Sidebar Filter Skeleton (Left 3 cols, No Search Option) ── */}
          <aside className="hidden md:block md:col-span-1 lg:col-span-3 bg-white p-5 border border-gray-200 rounded-lg shadow-xs space-y-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="h-5 w-16 bg-gray-300 rounded" />
              <div className="h-4 w-14 bg-gray-200 rounded" />
            </div>

            {/* Price Range Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-24 bg-gray-300 rounded" />
              <div className="h-2 w-full bg-gray-200 rounded-full my-3" />
              <div className="flex items-center justify-between gap-2">
                <div className="h-8 w-20 bg-gray-100 rounded border border-gray-200" />
                <div className="h-3 w-4 bg-gray-300 rounded" />
                <div className="h-8 w-20 bg-gray-100 rounded border border-gray-200" />
              </div>
            </div>

            {/* Categories Skeleton */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <div className="h-4 w-28 bg-gray-300 rounded mb-3" />
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded bg-gray-200" />
                    <div
                      className="h-3.5 bg-gray-200 rounded"
                      style={{ width: `${65 + (i * 12) % 40}px` }}
                    />
                  </div>
                  <div className="h-3 w-6 bg-gray-100 rounded" />
                </div>
              ))}
            </div>

            {/* Offers Filter Skeleton */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <div className="h-4 w-20 bg-gray-300 rounded mb-3" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2.5 py-1">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <div
                    className="h-3.5 bg-gray-200 rounded"
                    style={{ width: `${75 + (i * 14) % 35}px` }}
                  />
                </div>
              ))}
            </div>
          </aside>

          {/* ── Product Grid Area Skeleton (Right 9 cols) ── */}
          <main className="col-span-1 md:col-span-3 lg:col-span-9">
            {/* Result Count Bar Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-36 bg-gray-200 rounded" />
            </div>

            {/* Grid of Product Cards Skeleton (8 cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col shadow-xs"
                >
                  {/* Image Skeleton */}
                  <div className="relative aspect-square w-full bg-gray-200" />

                  {/* Info Skeleton */}
                  <div className="p-3 flex flex-col gap-2">
                    {/* Title lines */}
                    <div className="h-3.5 w-4/5 bg-gray-200 rounded" />
                    <div className="h-3 w-3/5 bg-gray-100 rounded" />

                    {/* Price and Add button row */}
                    <div className="mt-2 flex items-center justify-between pt-1">
                      <div className="flex flex-col gap-1">
                        <div className="h-4 w-16 bg-gray-300 rounded" />
                        <div className="h-3 w-10 bg-gray-100 rounded" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
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
