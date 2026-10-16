"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroGalleryItem } from "@/types/woocommerce";

interface HeroBannerProps {
  images?: HeroGalleryItem[];
}

export default function HeroBanner({ images = [] }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images.length > 0
    ? images
    : [{ id: 0, url: "/hero-bg.png", alt: "Anniversary Luxury Collection - luxuryladies" }];

  // Auto rotate if multiple images
  useEffect(() => {
    if (displayImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [displayImages.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  return (
    <section className="w-full relative h-[240px] sm:h-[380px] md:h-[520px] lg:h-[708px] overflow-hidden bg-bg group">
      {displayImages.map((img, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={img.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={img.url || "/hero-bg.png"}
              alt={img.alt || img.title || "Anniversary Luxury Collection - luxuryladies"}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        );
      })}

      {/* Navigation Arrows for Multiple Hero Images */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {displayImages.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  dotIdx === currentIndex
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
