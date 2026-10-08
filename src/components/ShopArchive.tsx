"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { WooCommerceProduct } from "@/types/woocommerce";

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  selectedCategories: string[];
  inStockOnly: boolean;
  offers: {
    bestPrice: boolean;
    hotDeals: boolean;
    newArrival: boolean;
    trending: boolean;
  };
  freeDeliveryOnly: boolean;
}

interface ShopArchiveProps {
  initialProducts: WooCommerceProduct[];
  categorySlug?: string;
  initialSearchQuery?: string;
}

const CATEGORY_OPTIONS = [
  { slug: "golden-picks", name: "Golden Picks" },
  { slug: "luxury-edit-heels", name: "Luxury Edit Heels" },
  { slug: "luxury-bags", name: "Luxury Bags" },
  { slug: "party-clutch", name: "Party Clutch" },
  { slug: "z-style-heels", name: "Z-Style Heels" },
  { slug: "2-pcs-pj-sets", name: "2 Pcs PJ Sets" },
  { slug: "flats-sandals", name: "Flats & Sandals" },
  { slug: "3-pcs-pj-sets", name: "3 Pcs PJ Sets" },
  { slug: "clearance-sale", name: "Clearance Sale" },
];

export default function ShopArchive({
  initialProducts,
  categorySlug,
  initialSearchQuery = "",
}: ShopArchiveProps) {
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);

  // Sync searchQuery if initialSearchQuery prop changes
  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Compute absolute min & max price dynamically from actual products
  const { absoluteMinPrice, absoluteMaxPrice } = useMemo(() => {
    if (initialProducts.length > 0) {
      const prices = initialProducts.map((p) => parseFloat(p.price) || 0);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      return { absoluteMinPrice: min, absoluteMaxPrice: max };
    }
    return { absoluteMinPrice: 0, absoluteMaxPrice: 5000 };
  }, [initialProducts]);

  // Filters state (initialized to the exact lowest and highest product price)
  const [minPrice, setMinPrice] = useState<number>(absoluteMinPrice);
  const [maxPrice, setMaxPrice] = useState<number>(absoluteMaxPrice);

  // Sync state if initialProducts changes
  React.useEffect(() => {
    setMinPrice(absoluteMinPrice);
    setMaxPrice(absoluteMaxPrice);
  }, [absoluteMinPrice, absoluteMaxPrice]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    categorySlug ? [categorySlug] : []
  );
  const [visibleCategoryCount, setVisibleCategoryCount] = useState<number>(5);
  const [inStock, setInStock] = useState<boolean>(false);
  const [outOfStock, setOutOfStock] = useState<boolean>(false);
  const [freeDelivery, setFreeDelivery] = useState<boolean>(false);
  const [selectedOffers, setSelectedOffers] = useState<{
    bestPrice: boolean;
    hotDeals: boolean;
    newArrival: boolean;
    trending: boolean;
  }>({
    bestPrice: false,
    hotDeals: false,
    newArrival: false,
    trending: false,
  });

  // Sort state
  const [sortBy, setSortBy] = useState<string>("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Lock body scroll when mobile filter is open (iOS-safe)
  React.useEffect(() => {
    if (mobileFilterOpen) {
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add("scroll-locked");
    } else {
      const scrollY = document.body.style.top;
      document.body.classList.remove("scroll-locked");
      document.body.style.top = "";
      if (scrollY) {
        window.scrollTo({ top: parseInt(scrollY || "0") * -1, behavior: "instant" });
      }
    }
    return () => {
      document.body.classList.remove("scroll-locked");
      document.body.style.top = "";
    };
  }, [mobileFilterOpen]);

  // Toggle Category
  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  // Toggle Offers
  const toggleOffer = (key: keyof typeof selectedOffers) => {
    setSelectedOffers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Clear all filters
  const handleClearAll = () => {
    setSearchQuery("");
    setMinPrice(absoluteMinPrice);
    setMaxPrice(absoluteMaxPrice);
    setSelectedCategories([]);
    setInStock(false);
    setOutOfStock(false);
    setFreeDelivery(false);
    setSelectedOffers({
      bestPrice: false,
      hotDeals: false,
      newArrival: false,
      trending: false,
    });
  };

  const isFilterActive = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      minPrice > absoluteMinPrice ||
      maxPrice < absoluteMaxPrice ||
      selectedCategories.length > 0 ||
      inStock ||
      outOfStock ||
      freeDelivery ||
      Object.values(selectedOffers).some(Boolean)
    );
  }, [
    searchQuery,
    minPrice,
    maxPrice,
    absoluteMinPrice,
    absoluteMaxPrice,
    selectedCategories,
    inStock,
    outOfStock,
    freeDelivery,
    selectedOffers,
  ]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialProducts
      .filter((product) => {
        // Search query filter (matches name, SKU, categories, or description)
        if (query) {
          const matchName = product.name?.toLowerCase().includes(query);
          const matchSku = product.sku?.toLowerCase().includes(query);
          const matchCat = product.categories?.some((c) =>
            c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query)
          );
          const matchDesc = product.description?.toLowerCase().includes(query) ||
            product.short_description?.toLowerCase().includes(query);

          if (!matchName && !matchSku && !matchCat && !matchDesc) {
            return false;
          }
        }

        const price = parseFloat(product.price) || 0;

        // Price filter (minPrice to maxPrice)
        if (price < minPrice || price > maxPrice) return false;

        // Category filter
        if (selectedCategories.length > 0) {
          const matchesCategory = product.categories.some((c) =>
            selectedCategories.includes(c.slug)
          );
          if (!matchesCategory) return false;
        }

        // Stock status filter (In stock / Out of stock)
        const currentStock = product.stock_status || "instock";
        if (inStock && !outOfStock) {
          if (currentStock !== "instock") return false;
        } else if (!inStock && outOfStock) {
          if (currentStock !== "outofstock") return false;
        }

        // Offers filter
        if (selectedOffers.hotDeals && !product.on_sale) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;

        switch (sortBy) {
          case "price-low-high":
            return priceA - priceB;
          case "price-high-low":
            return priceB - priceA;
          case "name-a-z":
            return a.name.localeCompare(b.name);
          case "newest":
          default:
            return b.id - a.id;
        }
      });
  }, [
    initialProducts,
    searchQuery,
    minPrice,
    maxPrice,
    selectedCategories,
    inStock,
    outOfStock,
    selectedOffers,
    sortBy,
  ]);

  // Multi-range progress calculation
  const minPercent = Math.min(
    100,
    Math.max(0, ((minPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice)) * 100)
  );
  const maxPercent = Math.min(
    100,
    Math.max(0, ((maxPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice)) * 100)
  );

  const priceGap = 100;

  // Categories sorted by product count descending
  const categoriesWithCount = useMemo(() => {
    return CATEGORY_OPTIONS.map((cat) => {
      const count = initialProducts.filter((p) =>
        p.categories?.some((c) => c.slug === cat.slug)
      ).length;
      return { ...cat, count };
    }).sort((a, b) => b.count - a.count);
  }, [initialProducts]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - priceGap);
    setMinPrice(Math.max(absoluteMinPrice, value));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + priceGap);
    setMaxPrice(Math.min(absoluteMaxPrice, value));
  };

  // Filter Sidebar Content Component
  const FilterContent = (
    <div className="flex flex-col space-y-6">
      {/* Header (desktop only - mobile uses dedicated modal header) */}
      <div className="hidden md:flex items-center justify-between pb-3 border-b border-[#F7E7EC]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#ff0080]" strokeWidth={2} />
          <h2 className="text-lg font-bold text-[#1a1a1a] tracking-tight">Filter</h2>
        </div>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs font-semibold text-[#ff0080] hover:text-[#d4006a] transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* ── 1. Price Multi-Range Slider ── */}
      <div>
        <span className="block text-sm font-semibold text-[#222] mb-3">
          Price Range
        </span>
        <div className="relative h-6 flex items-center">
          {/* Background Track */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#F2E8ED] rounded-full pointer-events-none" />

          {/* Active Highlight Range Track */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#ff0080] rounded-full pointer-events-none"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />

          {/* Dual Range Thumb Inputs */}
          <input
            id="min-price-slider"
            aria-label="Minimum price"
            type="range"
            min={absoluteMinPrice}
            max={absoluteMaxPrice}
            step={10}
            value={minPrice}
            onChange={handleMinChange}
            className="multi-range-input z-20"
          />
          <input
            id="max-price-slider"
            aria-label="Maximum price"
            type="range"
            min={absoluteMinPrice}
            max={absoluteMaxPrice}
            step={10}
            value={maxPrice}
            onChange={handleMaxChange}
            className="multi-range-input z-30"
          />
        </div>

        {/* Price Value Indicators */}
        <div className="flex items-center justify-between mt-2">
          <span className="inline-flex items-center justify-center px-3 py-1 bg-[#FBF0F4] text-xs font-semibold text-[#444] rounded-md min-w-[70px]">
            Tk {minPrice.toLocaleString()}
          </span>
          <span className="inline-flex items-center justify-center px-3 py-1 bg-[#FBF0F4] text-xs font-semibold text-[#444] rounded-md min-w-[70px]">
            Tk {maxPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Free Delivery (Right under Price Range) ── */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group select-none text-xs md:text-sm text-[#444] hover:text-[#ff0080] transition-colors">
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${freeDelivery
              ? "bg-[#ff0080] border-[#ff0080] text-white"
              : "border-[#d8cad0] bg-white group-hover:border-[#ff0080]"
              }`}
            onClick={() => setFreeDelivery(!freeDelivery)}
          >
            {freeDelivery && <Check size={12} strokeWidth={3} />}
          </div>
          <span onClick={() => setFreeDelivery(!freeDelivery)}>Free Delivery</span>
        </label>
      </div>

      {/* ── Offers Filter (Right under Free Delivery) ── */}
      <div className="pt-2">
        <h3 className="text-sm font-semibold text-[#222] mb-3">Offers</h3>
        <div className="space-y-2.5">
          {[
            { key: "bestPrice" as const, label: "BEST PRICE" },
            { key: "hotDeals" as const, label: "HOT DEALS" },
            { key: "newArrival" as const, label: "NEW ARRIVAL" },
            { key: "trending" as const, label: "TRENDING PRODUCTS" },
          ].map(({ key, label }) => {
            const isChecked = selectedOffers[key];
            return (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer group select-none text-xs md:text-sm text-[#444] hover:text-[#ff0080] transition-colors uppercase tracking-wide font-normal"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked
                    ? "bg-[#ff0080] border-[#ff0080] text-white"
                    : "border-[#d8cad0] bg-white group-hover:border-[#ff0080]"
                    }`}
                  onClick={() => toggleOffer(key)}
                >
                  {isChecked && <Check size={12} strokeWidth={3} />}
                </div>
                <span onClick={() => toggleOffer(key)}>{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="w-full h-[1px] bg-[#F7E7EC]" />

      {/* ── Category Filter (Ordered by count, showing 5 initially with Show More) ── */}
      <div className="pt-2">
        <h3 className="text-sm font-semibold text-[#222] mb-3">Category</h3>
        <div className="space-y-2.5">
          {categoriesWithCount.slice(0, visibleCategoryCount).map((cat) => {
            const isChecked = selectedCategories.includes(cat.slug);
            return (
              <label
                key={cat.slug}
                className="flex items-center justify-between cursor-pointer group select-none text-xs md:text-sm text-[#444] hover:text-[#ff0080] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked
                      ? "bg-[#ff0080] border-[#ff0080] text-white"
                      : "border-[#d8cad0] bg-white group-hover:border-[#ff0080]"
                      }`}
                    onClick={() => toggleCategory(cat.slug)}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span onClick={() => toggleCategory(cat.slug)}>{cat.name}</span>
                </div>
                {/* Category Count */}
                <span className="text-[11px] text-[#999] group-hover:text-[#ff0080] transition-colors font-medium">
                  ({cat.count})
                </span>
              </label>
            );
          })}
        </div>

        {/* Link-style Show More Button */}
        {visibleCategoryCount < categoriesWithCount.length && (
          <button
            type="button"
            onClick={() => setVisibleCategoryCount((prev) => prev + 5)}
            className="mt-3 text-xs font-semibold text-[#ff0080] hover:underline cursor-pointer inline-flex items-center gap-1 transition-colors"
          >
            + Show More
          </button>
        )}
      </div>

      {/* Subtle Divider */}
      <div className="w-full h-[1px] bg-[#F7E7EC]" />

      {/* ── 4. Stock Status ── */}
      <div className="pt-2">
        <h3 className="text-sm font-semibold text-[#222] mb-3">Stock Status</h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group select-none text-xs md:text-sm text-[#444] hover:text-[#ff0080] transition-colors">
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${inStock
                ? "bg-[#ff0080] border-[#ff0080] text-white"
                : "border-[#d8cad0] bg-white group-hover:border-[#ff0080]"
                }`}
              onClick={() => setInStock(!inStock)}
            >
              {inStock && <Check size={12} strokeWidth={3} />}
            </div>
            <span onClick={() => setInStock(!inStock)}>In Stock</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group select-none text-xs md:text-sm text-[#444] hover:text-[#ff0080] transition-colors">
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${outOfStock
                ? "bg-[#ff0080] border-[#ff0080] text-white"
                : "border-[#d8cad0] bg-white group-hover:border-[#ff0080]"
                }`}
              onClick={() => setOutOfStock(!outOfStock)}
            >
              {outOfStock && <Check size={12} strokeWidth={3} />}
            </div>
            <span onClick={() => setOutOfStock(!outOfStock)}>Out of Stock</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-6 md:py-10">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center gap-2 text-xs text-[#8C7B82] mb-1">
            <Link href="/" className="hover:text-[#ff0080] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#251A1F] font-medium">Shop</span>
            {categorySlug && (
              <>
                <span>/</span>
                <span className="text-[var(--color-primary)] capitalize">
                  {categorySlug.replace(/-/g, " ")}
                </span>
              </>
            )}
            {searchQuery.trim() && (
              <>
                <span>/</span>
                <span className="text-[var(--color-primary)]">
                  Search: &ldquo;{searchQuery.trim()}&rdquo;
                </span>
              </>
            )}
          </nav>
          <h1 className="text-xl md:text-2xl">
            {searchQuery.trim() ? (
              <span>
                Search results for{" "}
                <span className="text-[#ff0080]">&ldquo;{searchQuery.trim()}&rdquo;</span>
              </span>
            ) : categorySlug ? (
              CATEGORY_OPTIONS.find((c) => c.slug === categorySlug)?.name || "Shop Archive"
            ) : (
              "All Products"
            )}
          </h1>
        </div>

        {/* Sorting Dropdown & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-[#EDE0E5] rounded-md text-[#251A1F] hover:border-[#ff0080]"
          >
            <SlidersHorizontal size={14} className="text-[#ff0080]" />
            Filters {isFilterActive && <span className="w-2 h-2 rounded-full bg-[#ff0080]" />}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-[#EDE0E5] rounded-md px-4 py-2 pr-9 text-xs md:text-sm font-medium text-[#251A1F] focus:outline-none focus:border-[#ff0080] cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Product Name: A to Z</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* ── Main Layout: Sidebar + Product Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        {/* Desktop Sidebar (Left side, exactly matching user mockup) */}
        <aside className="hidden md:block md:col-span-1 lg:col-span-3 bg-white p-5 shadow-xs sticky top-28">
          {FilterContent}
        </aside>

        {/* Product Grid Area (Right side) */}
        <main className="col-span-1 md:col-span-3 lg:col-span-9">
          {/* Result Count and Active Tags */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[#8C7B82]">
              Showing <span className="font-semibold text-[#251A1F]">{filteredProducts.length}</span> of{" "}
              {initialProducts.length} products
            </p>

            {isFilterActive && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-[#ff0080] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showWishlist />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF5F8] flex items-center justify-center text-[#ff0080] mb-4">
                <SlidersHorizontal size={24} />
              </div>
              <h3 className="text-base font-semibold text-[#251A1F] mb-1">No products found</h3>
              <p className="text-xs text-[#8C7B82] max-w-sm mb-5">
                We couldn&apos;t find any items matching your current filters. Try resetting or adjusting your price and filter options.
              </p>
              <Link
                href="/shop"
                onClick={handleClearAll}
                className="px-5 py-2.5 bg-[#ff0080] hover:bg-[#d4006a] !text-white text-xs font-semibold rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <span className="!text-white text-inherit">All products</span>
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Filter Modal/Drawer (Full Screen & Full Height covering header) ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[999] flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Full Screen Drawer Panel */}
          <div className="relative ml-auto w-full max-w-[340px] h-[100dvh] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Clean Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F7E7EC] bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff0080]" strokeWidth={2} />
                <span className="font-bold text-sm text-[#1A1A1A] tracking-tight">Filter Products</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-[#ff0080] hover:text-[#d4006a] transition-colors cursor-pointer mr-1"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#ff0080] hover:bg-[#FFF5F8] transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {FilterContent}
            </div>

            {/* Bottom Sticky Action Button */}
            <div className="p-4 border-t border-[#F7E7EC] bg-white shrink-0 shadow-lg">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 !bg-[#ff0080] hover:!bg-[#d4006a] !text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>View {filteredProducts.length} Results</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
