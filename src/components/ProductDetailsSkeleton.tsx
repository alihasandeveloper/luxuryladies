"use client";

import React from "react";

interface ProductDetailsSkeletonProps {
  hasMultipleImages?: boolean;
  hasVariations?: boolean;
}

export default function ProductDetailsSkeleton({
  hasMultipleImages = true,
  hasVariations = true,
}: ProductDetailsSkeletonProps) {
  return (
    <div className="w-full py-6 md:py-10 bg-white animate-pulse">
      <div className="container max-w-[1328px] mx-auto">
        {/* ── Breadcrumb Skeleton ── */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-10 bg-gray-200 rounded-none" />
          <span className="text-gray-300 text-xs">/</span>
          <div className="h-3 w-12 bg-gray-200 rounded-none" />
          <span className="text-gray-300 text-xs">/</span>
          <div className="h-3 w-28 bg-gray-200 rounded-none" />
        </div>

        {/* ── Main Product Layout (Left: Image Gallery, Right: Details) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Gallery Column */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            {/* Main Featured Image */}
            <div className="aspect-square w-full bg-gray-200 rounded-none" />

            {/* Thumbnails Row */}
            {hasMultipleImages && (
              <div className="flex items-center gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 shrink-0 rounded-none"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Actions Column */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Category Tag */}
            <div className="h-4 w-24 bg-gray-200 rounded-none mb-3" />

            {/* Title */}
            <div className="h-7 w-4/5 bg-gray-300 rounded-none mb-4" />

            {/* Price */}
            <div className="h-7 w-36 bg-gray-300 rounded-none mb-5" />

            {/* Short Description */}
            <div className="space-y-2 mb-6 pb-5 border-b border-gray-100">
              <div className="h-3.5 w-full bg-gray-200 rounded-none" />
              <div className="h-3.5 w-5/6 bg-gray-200 rounded-none" />
              <div className="h-3.5 w-2/3 bg-gray-200 rounded-none" />
            </div>

            {/* Variation Options */}
            {hasVariations && (
              <div className="space-y-2 mb-6">
                <div className="h-3.5 w-24 bg-gray-300 rounded-none" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-9 bg-gray-100 rounded-none"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: Add to Cart & Buy Now (rounded-none, clean neutral gray) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="h-11 w-full bg-gray-200 rounded-none" />
              <div className="h-11 w-full bg-gray-300 rounded-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
