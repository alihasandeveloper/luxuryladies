import React from "react";

export default function ProductDetailsSkeleton() {
  return (
    <div className="w-full py-6 md:py-10 bg-white animate-pulse">
      <div className="container max-w-[1328px] mx-auto">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6 w-full lg:max-w-[calc(50%-1.5rem)]">
          <div className="h-3 w-10 bg-gray-200 rounded" />
          <span className="text-gray-300 text-xs">/</span>
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <span className="text-gray-300 text-xs">/</span>
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <span className="text-gray-300 text-xs">/</span>
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>

        {/* Main Product Card Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
          {/* Gallery Skeleton (Left 6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Featured Image Skeleton */}
            <div className="aspect-square w-full bg-gray-200 border border-gray-200 rounded-md" />
            {/* Thumbnails Row Skeleton */}
            <div className="flex items-center gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-18 h-18 md:w-20 md:h-20 bg-gray-100 border border-gray-200 rounded shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Details / Purchase Skeleton (Right 6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Category Tag & Wishlist Skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 bg-gray-200 rounded-full" />
              <div className="flex gap-2">
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200" />
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200" />
              </div>
            </div>

            {/* Title Skeleton */}
            <div className="h-8 w-4/5 bg-gray-300 rounded-md mt-1" />

            {/* Price Skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-28 bg-gray-300 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-100 rounded" />
            </div>

            {/* Taxes Note Skeleton */}
            <div className="h-3.5 w-36 bg-gray-100 rounded" />

            {/* Short Description Skeleton */}
            <div className="py-3 border-y border-gray-100 space-y-2">
              <div className="h-3.5 w-full bg-gray-200 rounded" />
              <div className="h-3.5 w-5/6 bg-gray-200 rounded" />
              <div className="h-3.5 w-3/4 bg-gray-100 rounded" />
            </div>

            {/* Size Selector Skeleton */}
            <div className="space-y-2.5">
              <div className="h-3.5 w-20 bg-gray-300 rounded" />
              <div className="flex flex-wrap gap-2">
                {[35, 36, 37, 38, 39, 40].map((sz) => (
                  <div key={sz} className="min-w-[42px] h-9 bg-gray-100 rounded-md border border-gray-200" />
                ))}
              </div>
            </div>

            {/* Quantity & Action Buttons Skeleton */}
            <div className="pt-2 space-y-3">
              <div className="h-9 w-28 bg-gray-100 rounded border border-gray-200" />
              <div className="h-11 w-full bg-gray-300 rounded-md" />
              <div className="h-11 w-full bg-gray-100 rounded-md border border-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
