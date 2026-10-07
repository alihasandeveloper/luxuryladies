"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Share2,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Ruler,
  Clock,
  Layers,
  ShoppingBag,
  Info,
  ZoomIn,
} from "lucide-react";
import { WooCommerceProduct } from "@/types/woocommerce";
import ProductCard from "@/components/ProductCard";

interface ProductDetailsProps {
  product: WooCommerceProduct;
  relatedProducts: WooCommerceProduct[];
}

export default function ProductDetails({
  product,
  relatedProducts,
}: ProductDetailsProps) {
  // Gallery active image
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [{ id: 1, src: "/file.svg", name: product.name, alt: product.name }];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showThumbNav, setShowThumbNav] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPosition({ x, y });
  };

  const handleSelectImage = (idx: number) => {
    setActiveImageIndex(idx);
    const container = thumbnailsRef.current;
    if (container) {
      const thumb = container.children[idx] as HTMLElement;
      if (thumb) {
        thumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  const handlePrevImage = () => {
    const newIdx =
      activeImageIndex === 0 ? galleryImages.length - 1 : activeImageIndex - 1;
    handleSelectImage(newIdx);
  };

  const handleNextImage = () => {
    const newIdx =
      activeImageIndex === galleryImages.length - 1 ? 0 : activeImageIndex + 1;
    handleSelectImage(newIdx);
  };

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailsRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      thumbnailsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Sizes available (fallback to default standard sizes if not defined in attributes)
  const sizeOptions =
    product.attributes?.find((a) => a.name.toLowerCase() === "size")?.options || [
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
    ];

  const [selectedSize, setSelectedSize] = useState<string>("36");
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [addedToCartToast, setAddedToCartToast] = useState<string | null>(null);

  const regularPrice = parseFloat(product.regular_price || product.price);
  const currentPrice = parseFloat(product.sale_price || product.price);
  const discountPercent =
    product.on_sale && regularPrice > currentPrice
      ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
      : 30;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCart = () => {
    setAddedToCartToast("Added to Cart!");
    setTimeout(() => setAddedToCartToast(null), 2500);
  };

  const handleBuyNow = () => {
    setAddedToCartToast("Redirecting to checkout...");
    setTimeout(() => setAddedToCartToast(null), 2500);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen py-6 md:py-10">
      <div className="container max-w-6xl mx-auto px-4">
        {/* ── Breadcrumb Navigation ── */}
        <nav className="flex items-center gap-2 text-xs text-[#8C7B82] mb-6 flex-wrap">
          <Link href="/" className="hover:text-[#ff0080] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#ff0080] transition-colors">
            Shop
          </Link>
          {product.categories?.[0] && (
            <>
              <span>/</span>
              <Link
                href={`/category/${product.categories[0].slug}`}
                className="hover:text-[#ff0080] transition-colors"
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <span>/</span>
          {product.name && (
            <span className="text-[#251A1F] font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          )}
        </nav>

        {/* ── Main Product Card (Two Columns) ── */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Gallery Column (7 cols on lg) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Main Featured Image with Magnifier Lens / Zoom Effect */}
              <div
                className="relative aspect-square w-full overflow-hidden bg-[#f8f8f8] border border-[#F2E6EC] cursor-zoom-in group/zoom"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <Image
                  src={galleryImages[activeImageIndex]?.src || galleryImages[0].src}
                  alt={galleryImages[activeImageIndex]?.alt || product.name || "Product"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-cover object-center transition-transform duration-150 ${
                    isZoomed ? "opacity-0" : "opacity-100"
                  }`}
                />

                {/* Magnified zoom layer */}
                {isZoomed && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                    style={{
                      backgroundImage: `url(${galleryImages[activeImageIndex]?.src || galleryImages[0].src})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: "220%",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}

                {/* Magnifier Glass Icon Badge */}
                {!isZoomed && (
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-xs border border-[#EDE0E5] shadow-xs flex items-center justify-center text-[#555] pointer-events-none transition-opacity group-hover/zoom:text-[#ff0080]">
                    <ZoomIn size={16} />
                  </div>
                )}
              </div>

              {/* Thumbnails Row (Only render if there are multiple images) */}
              {galleryImages.length > 1 && (
                <div
                  onClick={() => setShowThumbNav(true)}
                  className="relative flex items-center group/thumbs select-none"
                >
                  {/* Left scroll button (shown on wrapper click or hover) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollThumbnails("left");
                    }}
                    aria-label="Scroll thumbnails left"
                    className={`absolute -left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md border border-[#EDE0E5] text-[#444] hover:text-[#ff0080] flex items-center justify-center z-10 transition-all cursor-pointer ${
                      showThumbNav
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 group-hover/thumbs:opacity-100 pointer-events-none group-hover/thumbs:pointer-events-auto"
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div
                    ref={thumbnailsRef}
                    className="flex items-center gap-2.5 overflow-x-auto py-1.5 px-0.5 scroll-smooth w-full no-scrollbar select-none"
                  >
                    {galleryImages.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectImage(idx);
                        }}
                        className={`relative w-18 h-18 md:w-20 md:h-20 overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-[#fbfbfb] ${
                          activeImageIndex === idx
                            ? "border-[#ff0080] shadow-xs"
                            : "border-[#EDE0E5] hover:border-[#ff0080]/50 opacity-75 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt || `Thumbnail ${idx + 1}`}
                          fill
                          sizes="90px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Right scroll button (shown on wrapper click or hover) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollThumbnails("right");
                    }}
                    aria-label="Scroll thumbnails right"
                    className={`absolute -right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md border border-[#EDE0E5] text-[#444] hover:text-[#ff0080] flex items-center justify-center z-10 transition-all cursor-pointer ${
                      showThumbNav
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 group-hover/thumbs:opacity-100 pointer-events-none group-hover/thumbs:pointer-events-auto"
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Info & Purchase Column (6 cols on lg) */}
            <div className="lg:col-span-6 flex flex-col">
              {/* Top Tag & Actions */}
              <div className="flex items-center justify-between gap-4 mb-2">
                {product.categories?.[0]?.name ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF0F5] text-[#ff0080] border border-[#FFD6E3]">
                    ✦ {product.categories[0].name}
                  </span>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${isWishlisted
                      ? "bg-[#FFF0F5] border-[#ff0080] text-[#ff0080]"
                      : "border-[#E5D7DD] text-[#555] hover:border-[#ff0080] hover:text-[#ff0080] bg-white"
                      }`}
                    aria-label="Wishlist"
                  >
                    <Heart
                      size={18}
                      className={isWishlisted ? "fill-[#ff0080]" : ""}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-[#E5D7DD] text-[#555] hover:border-[#ff0080] hover:text-[#ff0080] bg-white transition-colors cursor-pointer"
                    aria-label="Share"
                    title={copied ? "Copied Link!" : "Share Link"}
                  >
                    <Share2 size={17} />
                  </button>
                </div>
              </div>

              {/* Product Title */}
              {product.name && (
                <h1 className="text-2xl md:text-3xl mb-2">
                  {product.name}
                </h1>
              )}

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-2xl md:text-3xl font-bold">
                  Tk {currentPrice.toLocaleString()}
                </h3>
                {regularPrice > currentPrice && (
                  <span className="text-base text-[#8C7B82] line-through">
                    Tk {regularPrice.toLocaleString()}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-2 py-0.5 bg-[#E8F8EE] text-[#1E824C] border border-[#C6EBD3] rounded-md text-xs font-bold">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Inclusive of taxes note */}
              <div className="flex items-center gap-1.5 text-xs text-[#8C7B82] mb-3">
                <Info size={14} className="text-[#8C7B82]" />
                <span>Inclusive of all taxes</span>
              </div>

              {/* Short Description */}
              {product.short_description && (
                <div
                  className="text-sm md:text-[15px] text-[#555] leading-relaxed mb-5 pb-3 border-b border-[#F7E7EC]"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              )}

              {/* Size Selector */}
              <div className="mb-5">
                <span className="block text-xs font-semibold text-[#222] mb-2.5">
                  Select Size
                </span>

                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((sz, i) => {
                    const isSelected = selectedSize === sz;
                    const isOutOfStock = i === 0; // matching first crossed option in screenshot
                    return (
                      <button
                        key={sz}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(sz)}
                        className={`min-w-[42px] h-9 px-2.5 rounded-md text-xs font-semibold flex items-center justify-center border transition-all cursor-pointer relative ${isSelected
                          ? "bg-[#ff0080] text-white border-[#ff0080] shadow-xs"
                          : isOutOfStock
                            ? "border-[#E8DFE3] text-[#B8ABB2] bg-[#FAF8F9] line-through cursor-not-allowed opacity-60"
                            : "border-[#E0D3D9] text-[#333] bg-white hover:border-[#ff0080]"
                          }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <span className="block text-xs font-semibold text-[#222] mb-2">
                  Quantity
                </span>
                <div className="inline-flex items-center border border-[#E0D3D9] rounded-md bg-white">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#ff0080] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} strokeWidth={2.5} />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#111]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#ff0080] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                {/* Cash on Delivery Feature Pill Banner */}
                <div className="w-full py-2.5 px-4 bg-[#149A8C] text-white rounded-md text-xs font-semibold text-center tracking-wide shadow-xs flex items-center justify-center gap-2">
                  <Truck size={16} />
                  <span>Cash On Delivery</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-3 !bg-[#ff0080] hover:!bg-[#d4006a] !text-white rounded-md text-xs font-bold tracking-wide shadow-xs transition-colors cursor-pointer"
                  >
                    Buy Now
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3 bg-white hover:bg-[#FFF0F5] text-[#ff0080] border-2 border-[#ff0080] rounded-md text-xs font-bold tracking-wide transition-colors cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>

                {addedToCartToast && (
                  <div className="p-2.5 bg-[#E8F8EE] border border-[#C6EBD3] text-[#1E824C] rounded-md text-xs font-medium text-center animate-in fade-in">
                    {addedToCartToast}
                  </div>
                )}
              </div>

              {/* Delivery Meta Information Details */}
              <div className="pt-4 border-t border-[#F2E6EC] space-y-2.5 text-xs text-[#555]">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#8C7B82] shrink-0" />
                  <span>
                    Delivery Time:{" "}
                    <strong className="text-[#222]">3-5 days</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#8C7B82] shrink-0" />
                  <span>
                    Payment:{" "}
                    <strong className="text-[#222]">COD Available</strong>
                  </span>
                </div>

                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#EDF5FF] text-[#206bc4] text-xs font-medium border border-[#D5E6FB]">
                    <Truck size={14} />
                    <span>Shipping</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Key Highlights Cards Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
          {product.sku && (
            <div className="bg-white p-4 rounded-xl border border-[#F2E6EC] flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#FFF0F5] text-[#ff0080] flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-[11px] text-[#8C7B82]">SKU</p>
                <p className="text-xs font-bold text-[#222] truncate">
                  {product.sku}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-xl border border-[#F2E6EC] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-[#FFF0F5] text-[#ff0080] flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[11px] text-[#8C7B82]">Delivery Time</p>
              <p className="text-xs font-bold text-[#222]">3-5 days</p>
            </div>
          </div>

          {sizeOptions.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-[#F2E6EC] flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#FFF0F5] text-[#ff0080] flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-[11px] text-[#8C7B82]">Variants</p>
                <p className="text-xs font-bold text-[#222]">
                  {sizeOptions.length} options
                </p>
              </div>
            </div>
          )}

          {product.total_sales !== undefined && product.total_sales !== null && (
            <div className="bg-white p-4 rounded-xl border border-[#F2E6EC] flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#E8F8EE] text-[#1E824C] flex items-center justify-center shrink-0">
                <Check size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] text-[#8C7B82]">Total Sold</p>
                <p className="text-xs font-bold text-[#222]">
                  {product.total_sales} units
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Product Description Section ── */}
        {(product.description || product.short_description) && (
          <div className="bg-white rounded-xl border border-[#F2E6EC] p-6 mb-10 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F7E7EC]">
              <Info size={17} className="text-[#ff0080]" />
              <h2 className="text-base font-semibold">
                Product Description
              </h2>
            </div>
            <div className="min-h-[140px] text-sm md:text-[15px] text-[#444] leading-relaxed">
              <p className="font-semibold text-base text-[#222] mb-3">
                {product.name} {product.sku ? `(${product.sku})` : ""}
              </p>
              {product.description ? (
                <div
                  className="mb-2 prose prose-sm max-w-none text-sm md:text-[15px] text-[#444] leading-relaxed [&>p]:mb-3 [&>ul]:space-y-1.5 [&>ul]:pl-5 [&>ul]:list-disc"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : product.short_description ? (
                <div
                  className="mb-2 prose prose-sm max-w-none text-sm md:text-[15px] text-[#444] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              ) : null}
            </div>
          </div>
        )}

        {/* ── Related Products ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-semibold">
              Related Products
            </h2>
            <Link
              href="/shop"
              className="text-xs font-semibold text-[#ff0080] hover:underline"
            >
              See More
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4">
            {relatedProducts.slice(0, 10).map((relProduct) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                showWishlist
              />
            ))}
          </div>

          {/* See More Button */}
          <div className="text-center mt-8">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-2.5 bg-[#ff0080] hover:bg-[#d4006a] !text-white text-xs font-bold rounded-md shadow-xs transition-colors"
            >
              See More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
