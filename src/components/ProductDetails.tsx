"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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

function matchAttributeKey(key1: string, key2: string, slug?: string): boolean {
  if (!key1 || !key2) return false;
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/^attribute_/, "")
      .replace(/^pa_/, "")
      .replace(/[-_]/g, "");
  const k1 = normalize(key1);
  const k2 = normalize(key2);
  const s = slug ? normalize(slug) : "";
  return k1 === k2 || (s !== "" && (k1 === s || k2 === s));
}

function normalizeOptionString(str: string): string {
  if (!str) return "";
  try {
    str = decodeURIComponent(str);
  } catch {}
  return str
    .toLowerCase()
    .trim()
    .replace(/[-_\s]+/g, "-")
    .replace(/[^\w-]/g, "");
}

function findMatchingOption(options: string[], targetOption: string): string | null {
  if (!targetOption || !options || options.length === 0) return null;
  const targetClean = targetOption.toLowerCase().trim();
  const targetNorm = normalizeOptionString(targetOption);

  // 1. Direct case-insensitive match
  const directMatch = options.find((opt) => opt && opt.toLowerCase().trim() === targetClean);
  if (directMatch) return directMatch;

  // 2. Normalized match (handles spaces, dashes, underscores, case)
  const normMatch = options.find((opt) => opt && normalizeOptionString(opt) === targetNorm);
  if (normMatch) return normMatch;

  // 3. Fallback partial/slug match
  const fallback = options.find((opt) => {
    if (!opt) return false;
    const o = normalizeOptionString(opt);
    return (
      o.length > 0 &&
      targetNorm.length > 0 &&
      (o === targetNorm || o.includes(targetNorm) || targetNorm.includes(o))
    );
  });
  if (fallback) return fallback;

  return null;
}

export default function ProductDetails({
  product,
  relatedProducts,
}: ProductDetailsProps) {
  // Gallery active image
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [{ id: 1, src: "/woocommerce-placeholder.webp", name: product.name, alt: product.name }];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showThumbNav, setShowThumbNav] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Ensure product details page always scrolls to top on initial load or product change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [product?.id]);

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

  // Determine if product is variable and extract genuine variation attributes
  const variationAttributes = useMemo(() => {
    if (!product.attributes || product.attributes.length === 0) return [];

    // If variations_data exists, find attributes that actually participate in variations
    if (product.variations_data && product.variations_data.length > 0) {
      const attrsInVariations = product.attributes.filter((attr) => {
        if (attr.variation) return true;
        return product.variations_data!.some((v) =>
          v.attributes?.some(
            (va) =>
              (va.id && attr.id && va.id === attr.id) ||
              matchAttributeKey(va.name, attr.name, attr.slug)
          )
        );
      });
      if (attrsInVariations.length > 0) {
        return attrsInVariations;
      }
    }

    return (product.attributes || []).filter((a) => a.variation);
  }, [product.attributes, product.variations_data]);

  const isVariableProduct =
    Boolean(
      product.type === "variable" ||
      (product.variations && product.variations.length > 0) ||
      (product.variations_data && product.variations_data.length > 0)
    ) && variationAttributes.length > 0;

  // Helper to extract default selections
  const computeInitialSelections = (): Record<string, string> => {
    const initial: Record<string, string> = {};
    if (variationAttributes.length === 0) return initial;

    // 1. Try from default_attributes if specified in WooCommerce
    if (product.default_attributes && product.default_attributes.length > 0) {
      variationAttributes.forEach((attr) => {
        const def = product.default_attributes?.find(
          (d) =>
            (d.id && attr.id && d.id === attr.id) ||
            matchAttributeKey(d.name, attr.name, attr.slug)
        );
        if (def && def.option) {
          const matched = findMatchingOption(attr.options, def.option);
          if (matched) {
            initial[attr.name] = matched;
          }
        }
      });
    }

    // 2. If no default_attributes or incomplete, pick from preferred in-stock variation
    if (
      Object.keys(initial).length < variationAttributes.length &&
      product.variations_data &&
      product.variations_data.length > 0
    ) {
      const preferredVar =
        product.variations_data.find(
          (v) => v.stock_status !== "outofstock" && v.purchasable !== false
        ) || product.variations_data[0];

      if (preferredVar?.attributes) {
        variationAttributes.forEach((attr) => {
          if (initial[attr.name]) return;
          const vAttr = preferredVar.attributes.find(
            (va) =>
              (va.id && attr.id && va.id === attr.id) ||
              matchAttributeKey(va.name, attr.name, attr.slug)
          );
          if (vAttr && vAttr.option) {
            const matched = findMatchingOption(attr.options, vAttr.option);
            if (matched) {
              initial[attr.name] = matched;
            }
          }
        });
      }
    }

    // 3. Fallback to first option of each attribute
    variationAttributes.forEach((attr) => {
      if (!initial[attr.name] && attr.options && attr.options.length > 0) {
        initial[attr.name] = attr.options[0];
      }
    });

    return initial;
  };

  // Initialize selected attributes
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    return computeInitialSelections();
  });

  // Keep selectedAttributes in sync if product changes
  useEffect(() => {
    if (isVariableProduct) {
      setSelectedAttributes(computeInitialSelections());
    } else {
      setSelectedAttributes({});
    }
  }, [product.id, isVariableProduct]);

  // Find currently matching variation from variations_data
  const matchingVariation = useMemo(() => {
    if (!isVariableProduct || !product.variations_data || product.variations_data.length === 0) {
      return null;
    }

    return (
      product.variations_data.find((v) => {
        if (!v.attributes || v.attributes.length === 0) {
          return true;
        }

        return v.attributes.every((vAttr) => {
          // Empty option in WooCommerce variation means "Any"
          if (!vAttr.option || vAttr.option.trim() === "") {
            return true;
          }

          const matchedProductAttr = variationAttributes.find(
            (pa) =>
              (vAttr.id && pa.id && vAttr.id === pa.id) ||
              matchAttributeKey(vAttr.name, pa.name, pa.slug)
          );

          const key = matchedProductAttr ? matchedProductAttr.name : vAttr.name;
          const selectedVal = selectedAttributes[key] || selectedAttributes[vAttr.name];

          if (!selectedVal) {
            return false;
          }

          const optionsToCompare = [vAttr.option];
          if (vAttr.slug && vAttr.slug !== vAttr.option) {
            optionsToCompare.push(vAttr.slug);
          }

          return Boolean(findMatchingOption(optionsToCompare, selectedVal));
        });
      }) || null
    );
  }, [isVariableProduct, product.variations_data, variationAttributes, selectedAttributes]);

  // When variation has its own image, automatically switch active image in gallery
  useEffect(() => {
    if (matchingVariation?.image?.src) {
      const foundIdx = galleryImages.findIndex(
        (img) => img.src === matchingVariation.image?.src
      );
      if (foundIdx !== -1) {
        setActiveImageIndex(foundIdx);
      }
    }
  }, [matchingVariation, galleryImages]);

  // Calculate pricing based on matching variation or product
  const rawVarRegular = matchingVariation?.regular_price || matchingVariation?.price;
  const parsedVarRegular = rawVarRegular ? parseFloat(rawVarRegular) : 0;
  const regularPrice =
    parsedVarRegular > 0
      ? parsedVarRegular
      : parseFloat(product.regular_price || product.price || "0");

  const rawVarCurrent = matchingVariation?.sale_price || matchingVariation?.price;
  const parsedVarCurrent = rawVarCurrent ? parseFloat(rawVarCurrent) : 0;
  const currentPrice =
    parsedVarCurrent > 0
      ? parsedVarCurrent
      : parseFloat(product.sale_price || product.price || "0");

  const isOnSale = matchingVariation
    ? Boolean(matchingVariation.on_sale || regularPrice > currentPrice)
    : Boolean(product.on_sale && regularPrice > currentPrice);

  const discountPercent =
    isOnSale && regularPrice > currentPrice
      ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
      : 0;

  // Accurate stock status for current selection
  const isCurrentOutOfStock = isVariableProduct
    ? !matchingVariation ||
      matchingVariation.stock_status === "outofstock" ||
      matchingVariation.purchasable === false
    : product.stock_status === "outofstock" || product.purchasable === false;

  // Helper to check if a specific attribute option exists and has available stock
  const getOptionStatus = (
    attrName: string,
    optionVal: string
  ): { exists: boolean; inStock: boolean } => {
    if (!product.variations_data || product.variations_data.length === 0) {
      return { exists: true, inStock: true };
    }

    const targetAttr = variationAttributes.find((a) => a.name === attrName);

    const matchingVars = product.variations_data.filter((v) => {
      if (!v.attributes || v.attributes.length === 0) return true;

      // 1. Check target attribute
      const thisVAttr = v.attributes.find(
        (a) =>
          (targetAttr && a.id && targetAttr.id && a.id === targetAttr.id) ||
          matchAttributeKey(a.name, attrName, targetAttr?.slug)
      );
      if (thisVAttr && thisVAttr.option && thisVAttr.option.trim() !== "") {
        const optionsToCompare = [thisVAttr.option];
        if (thisVAttr.slug && thisVAttr.slug !== thisVAttr.option) {
          optionsToCompare.push(thisVAttr.slug);
        }
        if (!findMatchingOption(optionsToCompare, optionVal)) {
          return false;
        }
      }

      // 2. Check other selected attributes
      for (const otherAttr of variationAttributes) {
        if (otherAttr.name === attrName) continue;
        const otherSelectedVal = selectedAttributes[otherAttr.name];
        if (!otherSelectedVal) continue;

        const otherVAttr = v.attributes.find(
          (a) =>
            (otherAttr.id && a.id && otherAttr.id === a.id) ||
            matchAttributeKey(a.name, otherAttr.name, otherAttr.slug)
        );
        if (otherVAttr && otherVAttr.option && otherVAttr.option.trim() !== "") {
          const otherOptions = [otherVAttr.option];
          if (otherVAttr.slug && otherVAttr.slug !== otherVAttr.option) {
            otherOptions.push(otherVAttr.slug);
          }
          if (!findMatchingOption(otherOptions, otherSelectedVal)) {
            return false;
          }
        }
      }

      return true;
    });

    if (matchingVars.length === 0) {
      return { exists: false, inStock: false };
    }

    const inStock = matchingVars.some(
      (v) => v.stock_status !== "outofstock" && v.purchasable !== false
    );

    return { exists: true, inStock };
  };

  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [addedToCartToast, setAddedToCartToast] = useState<string | null>(null);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCart = () => {
    if (isCurrentOutOfStock) return;
    const details = Object.entries(selectedAttributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    setAddedToCartToast(details ? `Added to Cart (${details})!` : "Added to Cart!");
    setTimeout(() => setAddedToCartToast(null), 2500);
  };

  const handleBuyNow = () => {
    if (isCurrentOutOfStock) return;
    setAddedToCartToast("Redirecting to checkout...");
    setTimeout(() => setAddedToCartToast(null), 2500);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="w-full py-6 md:py-10">
      <div className="container max-w-[1328px] mx-auto">
        {/* ── Breadcrumb Navigation ── */}
        <nav className="flex items-center gap-1.5 md:gap-2 text-xs text-[#8C7B82] mb-6 w-full lg:max-w-[calc(50%-1.5rem)] min-w-0">
          <Link href="/" className="hover:text-[#ff0080] transition-colors shrink-0">
            Home
          </Link>
          <span className="shrink-0">/</span>
          <Link href="/shop" className="hover:text-[#ff0080] transition-colors shrink-0">
            Shop
          </Link>
          {product.categories?.[0] && (
            <>
              <span className="shrink-0">/</span>
              <Link
                href={`/category/${product.categories[0].slug}`}
                className="hover:text-[#ff0080] transition-colors shrink-0 max-w-[140px] truncate"
                title={product.categories[0].name}
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <span className="shrink-0">/</span>
          {product.name && (
            <span
              className="text-[#251A1F] font-medium truncate min-w-0 flex-1"
              title={product.name}
            >
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
                  className={`object-cover object-center transition-transform duration-150 ${isZoomed ? "opacity-0" : "opacity-100"
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
                    className={`absolute -left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md border border-[#EDE0E5] text-[#444] hover:text-[#ff0080] flex items-center justify-center z-10 transition-all cursor-pointer ${showThumbNav
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
                        className={`relative w-18 h-18 md:w-20 md:h-20 overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-[#fbfbfb] ${activeImageIndex === idx
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
                    className={`absolute -right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md border border-[#EDE0E5] text-[#444] hover:text-[#ff0080] flex items-center justify-center z-10 transition-all cursor-pointer ${showThumbNav
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

              {/* Short Description */}
              {product.short_description && (
                <div
                  className="text-sm md:text-[15px] text-slate-600 leading-relaxed mb-5 pb-3 border-b border-[#F7E7EC]"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              )}

              {/* Dynamic Attribute Selectors */}
              {isVariableProduct && (
                <div className="space-y-4 mb-5">
                  {variationAttributes.map((attr) => {
                    const currentVal = selectedAttributes[attr.name];

                    return (
                      <div key={attr.id || attr.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[#222]">
                            Select {attr.name}:{" "}
                            <span className="font-bold text-[#ff0080]">
                              {currentVal || "Choose an option"}
                            </span>
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {attr.options.map((option) => {
                            const isSelected = Boolean(
                              currentVal &&
                                (currentVal.toLowerCase().trim() === option.toLowerCase().trim() ||
                                  normalizeOptionString(currentVal) === normalizeOptionString(option))
                            );
                            const { exists, inStock } = getOptionStatus(attr.name, option);

                            return (
                              <button
                                key={option}
                                type="button"
                                disabled={!exists}
                                onClick={() => {
                                  setSelectedAttributes((prev) => ({
                                    ...prev,
                                    [attr.name]: option,
                                  }));
                                }}
                                className={`min-w-[44px] h-9 px-3 rounded-md text-xs font-semibold flex items-center justify-center border transition-all cursor-pointer relative ${
                                  isSelected
                                    ? inStock
                                      ? "bg-[#ff0080] text-white border-[#ff0080] shadow-xs ring-2 ring-[#ff0080]/30"
                                      : "bg-[#E53935] text-white border-[#E53935] shadow-xs ring-2 ring-[#E53935]/30"
                                    : !exists
                                      ? "border-[#E8DFE3] text-[#B8ABB2] bg-[#FAF8F9] line-through cursor-not-allowed opacity-40 pointer-events-none"
                                      : !inStock
                                        ? "border-[#F2D6D6] text-[#C53030] bg-[#FFF5F5] line-through hover:border-[#E53935]"
                                        : "border-[#E0D3D9] text-[#333] bg-white hover:border-[#ff0080] hover:text-[#ff0080]"
                                }`}
                                title={
                                  !exists
                                    ? `${option} (Not available)`
                                    : !inStock
                                      ? `${option} (Out of stock)`
                                      : option
                                }
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Stock status text */}
              <div className="mb-5 flex items-center">
                <span
                  className={`text-xs font-medium flex items-center gap-1.5 ${isCurrentOutOfStock ? "text-[#E53935]" : "text-[#718096]"
                    }`}
                >
                  <span className="text-base leading-none select-none">•</span>
                  <span>{isCurrentOutOfStock ? "Out of stock" : "Stock available"}</span>
                </span>
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
                <div className="w-full py-2.5 px-4 bg-[#FFF0F5] text-[#ff0080] border border-[#FFD6E3] rounded-md text-xs font-semibold text-center tracking-wide shadow-2xs flex items-center justify-center gap-2">
                  <Truck size={16} />
                  <span>Cash On Delivery Available Nationwide</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isCurrentOutOfStock}
                    onClick={handleBuyNow}
                    className={`w-full py-3 rounded-md text-xs font-bold tracking-wide shadow-xs transition-colors ${isCurrentOutOfStock
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "!bg-[#ff0080] hover:!bg-[#d4006a] !text-white cursor-pointer"
                      }`}
                  >
                    {isCurrentOutOfStock ? "Out of Stock" : "Buy Now"}
                  </button>

                  <button
                    type="button"
                    disabled={isCurrentOutOfStock}
                    onClick={handleAddToCart}
                    className={`w-full py-3 rounded-md text-xs font-bold tracking-wide transition-colors ${isCurrentOutOfStock
                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-[#FFF0F5] text-[#ff0080] border-2 border-[#ff0080] cursor-pointer"
                      }`}
                  >
                    {isCurrentOutOfStock ? "Unavailable" : "Add to Cart"}
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
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFF5F8] text-[#ff0080] text-xs font-medium border border-[#F2E6EC]">
                    <Truck size={14} />
                    <span>Free Shipping on Pre-orders</span>
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

          {isVariableProduct && (
            <div className="bg-white p-4 rounded-xl border border-[#F2E6EC] flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#FFF0F5] text-[#ff0080] flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-[11px] text-[#8C7B82]">Variants</p>
                <p className="text-xs font-bold text-[#222]">
                  {product.variations_data?.length || "Available"}
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
            <div className="min-h-[140px] text-sm md:text-[15px] text-slate-600 leading-relaxed">
              <p className="font-semibold text-base text-[#222] mb-3">
                {product.name} {product.sku ? `(${product.sku})` : ""}
              </p>
              {product.description ? (
                <div
                  className="mb-2 prose prose-sm max-w-none text-sm md:text-[15px] text-slate-600 leading-relaxed [&>p]:mb-3 [&>ul]:space-y-1.5 [&>ul]:pl-5 [&>ul]:list-disc"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : product.short_description ? (
                <div
                  className="mb-2 prose prose-sm max-w-none text-sm md:text-[15px] text-slate-600 leading-relaxed"
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
              className="text-xs md:text-sm font-medium text-[#555] hover:!text-[#ff0080] inline-flex items-center gap-0.5 transition-colors group cursor-pointer"
            >
              <span className="hover:!text-[#ff0080]">See More</span>
              <ChevronRight
                size={15}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-0.5"
              />
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
