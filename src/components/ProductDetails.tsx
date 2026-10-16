"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import {
  Heart,
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
  ZoomOut,
  X,
} from "lucide-react";
import { WooCommerceProduct, WooCommerceVariation } from "@/types/woocommerce";
import ProductCard from "@/components/ProductCard";
import Button from "@/components/Button";

interface ProductDetailsProps {
  product: WooCommerceProduct;
  relatedProducts: WooCommerceProduct[];
}

/**
 * Normalizes attribute name for robust WooCommerce matching
 * Handles "Size", "pa_size", "attribute_pa_size", "Color", etc.
 */
function normAttrName(name: string): string {
  if (!name) return "";
  let str = String(name);
  try {
    str = decodeURIComponent(str);
  } catch { }
  return str
    .toLowerCase()
    .trim()
    .replace(/^attribute_/, "")
    .replace(/^pa_/, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Normalizes attribute option value for robust matching
 * Handles "Wine", "wine", "XL", "xl", "Off-White", "off white", etc.
 */
function normOptionVal(val: string): string {
  if (!val) return "";
  let str = String(val);
  try {
    str = decodeURIComponent(str);
  } catch { }
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Checks whether a variation is in stock and available for purchase
 */
function isVariationInStock(v: WooCommerceVariation): boolean {
  if (!v) return false;
  if ((v as any).status && (v as any).status !== "publish") return false;
  if (v.stock_status === "outofstock") return false;
  if (v.purchasable === false && v.stock_status !== "instock") return false;

  if (
    v.manage_stock === true &&
    v.stock_quantity !== null &&
    v.stock_quantity !== undefined
  ) {
    const qty = Number(v.stock_quantity);
    if (!isNaN(qty) && qty <= 0 && v.stock_status !== "onbackorder") {
      return false;
    }
  }

  return true;
}

/**
 * Checks if a single variation matches a target attribute name & option value
 */
function isVariationMatchingAttr(
  v: WooCommerceVariation,
  attrName: string,
  selectedOption: string
): boolean {
  if (!selectedOption) return true;
  const targetAttr = normAttrName(attrName);
  const targetOption = normOptionVal(selectedOption);

  const rawAttrs = v.attributes;
  if (!rawAttrs) return true;

  const vAttrs: Array<{ name: string; option: string }> = Array.isArray(rawAttrs)
    ? rawAttrs.map((a: any) => ({
      name: String(a?.name || a?.attribute || a?.slug || ""),
      option: String(a?.option ?? a?.value ?? ""),
    }))
    : typeof rawAttrs === "object"
      ? Object.entries(rawAttrs).map(([k, val]) => ({
        name: String(k),
        option: String(val ?? ""),
      }))
      : [];

  const matched = vAttrs.find((a) => normAttrName(a.name) === targetAttr);

  // If variation does not specify this attribute or option is empty,
  // in WooCommerce that means "Any <Attribute>" (wildcard)!
  if (!matched || !matched.option || matched.option.trim() === "") {
    return true;
  }

  return normOptionVal(matched.option) === targetOption;
}

/**
 * Checks if a variation matches all currently selected attributes
 */
function variationMatchesAllSelections(
  v: WooCommerceVariation,
  selections: Record<string, string>
): boolean {
  for (const [attrName, optVal] of Object.entries(selections)) {
    if (optVal) {
      if (!isVariationMatchingAttr(v, attrName, optVal)) {
        return false;
      }
    }
  }
  return true;
}


export default function ProductDetails({
  product,
  relatedProducts,
}: ProductDetailsProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  // DEBUG: Log full product data in a single object to browser console
  useEffect(() => {
    console.log("PRODUCT_DEBUG_DATA", {
      product,
      type: product.type,
      purchasable: product.purchasable,
      price: product.price,
      regular_price: product.regular_price,
      sale_price: product.sale_price,
      stock_status: product.stock_status,
      attributes: product.attributes,
      default_attributes: product.default_attributes,
      variations: product.variations,
      variations_data: product.variations_data,
    });
  }, [product]);

  // Dynamic gallery images
  const galleryImages = useMemo(() => {
    const baseImages =
      product.images && product.images.length > 0
        ? [...product.images]
        : [
          {
            id: 1,
            src: "/woocommerce-placeholder.webp",
            name: product.name,
            alt: product.name,
          },
        ];

    if (product.variations_data && product.variations_data.length > 0) {
      product.variations_data.forEach((v) => {
        if (
          v.image &&
          v.image.src &&
          !baseImages.some((img) => img.src === v.image?.src)
        ) {
          baseImages.push({
            id: v.image.id || v.id,
            src: v.image.src,
            name: v.image.name || `${product.name} - ${v.sku || "Variation"}`,
            alt: v.image.alt || `${product.name} - ${v.sku || "Variation"}`,
          });
        }
      });
    }

    return baseImages;
  }, [product.images, product.variations_data, product.name]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showThumbNav, setShowThumbNav] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Close lightbox on Escape and support keyboard arrow navigation
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) =>
          prev === 0 ? galleryImages.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) =>
          prev === galleryImages.length - 1 ? 0 : prev + 1
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen, galleryImages.length]);

  // Ensure product details page always scrolls to top on initial load or product change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [product?.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    if (!width || !height) return;
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

  // Check if product actually has configured variations in WooCommerce
  const hasConfiguredVariations = Boolean(
    (product.variations && product.variations.length > 0) ||
    (product.variations_data && product.variations_data.length > 0)
  );

  // Determine if product is variable and extract genuine variation attributes
  const variationAttributes = useMemo(() => {
    if (!product.attributes || product.attributes.length === 0) return [];
    if (!hasConfiguredVariations) return [];

    const varAttrs = product.attributes.filter((a) => Boolean(a.variation));
    if (varAttrs.length > 0) return varAttrs;

    if (product.variations_data && product.variations_data.length > 0) {
      return product.attributes.filter((attr) => {
        const normA = normAttrName(attr.name);
        return product.variations_data!.some((v) => {
          const rawAttrs = v.attributes;
          if (!rawAttrs) return false;
          if (Array.isArray(rawAttrs)) {
            return rawAttrs.some((va: any) => normAttrName(va.name || va.attribute || va.slug || "") === normA);
          }
          if (typeof rawAttrs === "object") {
            return Object.keys(rawAttrs).some((k) => normAttrName(k) === normA);
          }
          return false;
        });
      });
    }

    return [];
  }, [product.attributes, product.variations_data, hasConfiguredVariations]);

  const isVariableProduct = hasConfiguredVariations && variationAttributes.length > 0;

  // Helper to extract default selections ONLY if explicitly set in WooCommerce backend
  const computeInitialSelections = (): Record<string, string> => {
    const initial: Record<string, string> = {};
    if (!variationAttributes || variationAttributes.length === 0) return initial;

    const defaultAttrs = product.default_attributes;
    // If NO default attributes are set in WooCommerce, return empty {} (no attribute is selected!)
    if (!defaultAttrs || !Array.isArray(defaultAttrs) || defaultAttrs.length === 0) {
      return {};
    }

    variationAttributes.forEach((attr) => {
      const normA = normAttrName(attr.name);
      const def = defaultAttrs.find((d: any) => {
        const dName = normAttrName(d.name || d.attribute || d.slug || "");
        return dName === normA;
      });

      if (def) {
        const defOption = String((def as any).option ?? (def as any).value ?? "").trim();
        if (defOption) {
          const normDef = normOptionVal(defOption);
          const matched = attr.options.find((opt: any) => {
            const optStr = typeof opt === "string" ? opt : opt.name || opt.option || String(opt);
            return normOptionVal(optStr) === normDef;
          });
          if (matched) {
            initial[attr.name] = typeof matched === "string" ? matched : (matched as any).name || (matched as any).option;
          } else {
            initial[attr.name] = defOption;
          }
        }
      }
    });

    return initial;
  };

  // Initialize selected attributes
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    () => computeInitialSelections()
  );

  // Keep selectedAttributes in sync if product changes
  useEffect(() => {
    if (isVariableProduct) {
      setSelectedAttributes(computeInitialSelections());
    } else {
      setSelectedAttributes({});
    }
  }, [product.id, isVariableProduct, product.default_attributes]);

  // Check if all variation attributes are currently selected
  const isAllAttributesSelected = useMemo(() => {
    if (!isVariableProduct) return true;
    if (variationAttributes.length === 0) return true;
    return variationAttributes.every((attr) => Boolean(selectedAttributes[attr.name]));
  }, [isVariableProduct, variationAttributes, selectedAttributes]);

  // Find currently matching variation from variations_data
  const matchingVariation = useMemo(() => {
    if (
      !isVariableProduct ||
      !product.variations_data ||
      product.variations_data.length === 0 ||
      !isAllAttributesSelected
    ) {
      return null;
    }

    return (
      product.variations_data.find((v) =>
        variationMatchesAllSelections(v, selectedAttributes)
      ) || null
    );
  }, [
    isVariableProduct,
    product.variations_data,
    variationAttributes,
    selectedAttributes,
    isAllAttributesSelected,
  ]);

  // Switch active image in gallery when matching variation changes
  useEffect(() => {
    if (matchingVariation?.image?.src) {
      const foundIdx = galleryImages.findIndex(
        (img) => img.src === matchingVariation.image?.src
      );
      if (foundIdx !== -1) {
        setActiveImageIndex(foundIdx);
      }
    } else if (!matchingVariation && activeImageIndex !== 0) {
      setActiveImageIndex(0);
    }
  }, [matchingVariation, galleryImages]);

  // Price range computation for variable products
  const priceRange = useMemo(() => {
    if (
      !isVariableProduct ||
      !product.variations_data ||
      product.variations_data.length === 0
    ) {
      return null;
    }
    const prices = product.variations_data
      .map((v) => parseFloat(v.sale_price || v.price || v.regular_price || "0"))
      .filter((p) => p > 0);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max, isRange: min !== max };
  }, [isVariableProduct, product.variations_data]);

  // Calculate pricing strictly for selected variation or parent fallback
  const { regularPrice, currentPrice, isOnSale, discountPercent } = useMemo(() => {
    if (matchingVariation) {
      const varReg = parseFloat(matchingVariation.regular_price || "0");
      const varSale = parseFloat(matchingVariation.sale_price || "0");
      const varPrice = parseFloat(matchingVariation.price || "0");

      if (varSale > 0 && varReg > 0 && varReg > varSale) {
        return {
          regularPrice: varReg,
          currentPrice: varSale,
          isOnSale: true,
          discountPercent: Math.round(((varReg - varSale) / varReg) * 100),
        };
      } else {
        const finalPrice = varReg > 0 ? varReg : varPrice;
        if (finalPrice > 0) {
          return {
            regularPrice: finalPrice,
            currentPrice: finalPrice,
            isOnSale: false,
            discountPercent: 0,
          };
        }
      }
    }

    const prodReg = parseFloat(product.regular_price || "0");
    const prodSale = parseFloat(product.sale_price || "0");
    const prodPrice = parseFloat(product.price || "0");

    if (
      isVariableProduct &&
      prodReg === 0 &&
      prodSale === 0 &&
      prodPrice === 0 &&
      priceRange
    ) {
      return {
        regularPrice:
          priceRange.max > priceRange.min ? priceRange.max : priceRange.min,
        currentPrice: priceRange.min,
        isOnSale: priceRange.max > priceRange.min,
        discountPercent:
          priceRange.max > priceRange.min
            ? Math.round(
              ((priceRange.max - priceRange.min) / priceRange.max) * 100
            )
            : 0,
      };
    }

    if (prodSale > 0 && prodReg > 0 && prodReg > prodSale) {
      return {
        regularPrice: prodReg,
        currentPrice: prodSale,
        isOnSale: true,
        discountPercent: Math.round(((prodReg - prodSale) / prodReg) * 100),
      };
    }

    const fallbackPrice = prodReg > 0 ? prodReg : prodPrice;
    return {
      regularPrice: fallbackPrice,
      currentPrice: prodSale > 0 ? prodSale : fallbackPrice,
      isOnSale: Boolean(
        product.on_sale && fallbackPrice > prodSale && prodSale > 0
      ),
      discountPercent: 0,
    };
  }, [matchingVariation, product, isVariableProduct, priceRange]);

  // Accurate stock status for current selection
  const isCurrentOutOfStock = isVariableProduct
    ? isAllAttributesSelected
      ? matchingVariation
        ? !isVariationInStock(matchingVariation)
        : true
      : false
    : product.stock_status === "outofstock" || product.purchasable === false;

  const isUnconfiguredOrUnavailable =
    (product.type === "variable" && !hasConfiguredVariations) ||
    (!isVariableProduct && product.purchasable === false && currentPrice <= 0);


  const handleSelectAttributeOption = (attrName: string, optionVal: string) => {
    setShowVariantAlert(false);

    const currentVal = selectedAttributes[attrName];
    const isCurrentlySelected =
      Boolean(currentVal) && normOptionVal(currentVal) === normOptionVal(optionVal);

    // Toggle off if already selected
    if (isCurrentlySelected) {
      setSelectedAttributes((prev) => {
        const next = { ...prev };
        delete next[attrName];
        return next;
      });
      return;
    }

    // Update selection cleanly without altering any other attribute
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: optionVal,
    }));
  };

  const [quantity, setQuantity] = useState<number>(1);

  // Maximum purchasable quantity for currently selected variation or product
  const maxAvailableQuantity = useMemo(() => {
    if (matchingVariation) {
      if (
        matchingVariation.manage_stock === true &&
        matchingVariation.stock_quantity !== null &&
        matchingVariation.stock_quantity !== undefined &&
        Number(matchingVariation.stock_quantity) > 0
      ) {
        return Number(matchingVariation.stock_quantity);
      }
    }
    return 99;
  }, [matchingVariation]);

  // Reset quantity if it exceeds maxAvailableQuantity when switching variations
  useEffect(() => {
    if (quantity > maxAvailableQuantity) {
      setQuantity(Math.max(1, maxAvailableQuantity));
    }
  }, [maxAvailableQuantity, quantity]);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [showVariantAlert, setShowVariantAlert] = useState<boolean>(false);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const variantSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  const triggerVariantAlert = () => {
    setShowVariantAlert(true);
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => setShowVariantAlert(false), 3000);
    if (variantSectionRef.current) {
      const rect = variantSectionRef.current.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        variantSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  const handleAddToCart = () => {
    if (isVariableProduct && !isAllAttributesSelected) {
      triggerVariantAlert();
      return;
    }

    if (isCurrentOutOfStock) return;
    const sortedAttrs = Object.keys(selectedAttributes)
      .sort()
      .reduce<Record<string, string>>((acc, key) => {
        acc[key] = selectedAttributes[key];
        return acc;
      }, {});
    const cartItemId = `${product.id}-${matchingVariation?.id || 0
      }-${JSON.stringify(sortedAttrs)}`;
    addToCart(
      {
        id: cartItemId,
        productId: product.id,
        variationId: matchingVariation?.id,
        name: product.name,
        slug: product.slug,
        sku: matchingVariation?.sku || product.sku || undefined,
        price: currentPrice,
        regularPrice: regularPrice > currentPrice ? regularPrice : undefined,
        image:
          matchingVariation?.image?.src ||
          product.images?.[0]?.src ||
          "/woocommerce-placeholder.webp",
        selectedAttributes: { ...selectedAttributes },
        stockStatus: "instock",
      },
      quantity
    );

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);

    const details = Object.entries(selectedAttributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    toast.success(`${product.name} added to cart!`, {
      description: details || undefined,
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart"),
      },
    });
  };

  const handleBuyNow = () => {
    if (isVariableProduct && !isAllAttributesSelected) {
      triggerVariantAlert();
      return;
    }

    if (isCurrentOutOfStock) return;
    const sortedAttrs = Object.keys(selectedAttributes)
      .sort()
      .reduce<Record<string, string>>((acc, key) => {
        acc[key] = selectedAttributes[key];
        return acc;
      }, {});
    const cartItemId = `${product.id}-${matchingVariation?.id || 0
      }-${JSON.stringify(sortedAttrs)}`;
    addToCart(
      {
        id: cartItemId,
        productId: product.id,
        variationId: matchingVariation?.id,
        name: product.name,
        slug: product.slug,
        sku: matchingVariation?.sku || product.sku || undefined,
        price: currentPrice,
        regularPrice: regularPrice > currentPrice ? regularPrice : undefined,
        image:
          matchingVariation?.image?.src ||
          product.images?.[0]?.src ||
          "/woocommerce-placeholder.webp",
        selectedAttributes: { ...selectedAttributes },
        stockStatus: "instock",
      },
      quantity
    );
    router.push("/checkout");
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) =>
      Math.max(1, Math.min(maxAvailableQuantity, prev + delta))
    );
  };

  return (
    <div className="w-full py-6 md:py-10">
      <div className="container max-w-[1328px] mx-auto">
        {/* ── Breadcrumb Navigation ── */}
        <nav className="flex items-center gap-1.5 md:gap-2 text-xs text-description mb-6 w-full lg:max-w-[calc(50%-1.5rem)] min-w-0">
          <Link href="/" className="hover:text-primary transition-colors shrink-0">
            Home
          </Link>
          <span className="shrink-0">/</span>
          <Link
            href="/shop"
            className="hover:text-primary transition-colors shrink-0"
          >
            Shop
          </Link>
          {product.categories?.[0] && (
            <>
              <span className="shrink-0">/</span>
              <Link
                href={`/category/${product.categories[0].slug}`}
                className="hover:text-primary transition-colors shrink-0 max-w-[140px] truncate"
                title={product.categories[0].name}
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <span className="shrink-0">/</span>
          {product.name && (
            <span
              className="text-dark font-medium truncate min-w-0 flex-1"
              title={product.name}
            >
              {product.name}
            </span>
          )}
        </nav>

        {/* ── Main Product Card (Two Columns) ── */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Gallery Column (6 cols on lg) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Main Featured Image with Magnifier Lens / Zoom Effect */}
              <div
                className="relative aspect-square w-full overflow-hidden bg-bg/30 border border-border cursor-zoom-in group/zoom select-none"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => {
                  setLightboxZoom(1);
                  setIsLightboxOpen(true);
                }}
              >
                <Image
                  src={
                    galleryImages[activeImageIndex]?.src ||
                    galleryImages[0]?.src ||
                    "/woocommerce-placeholder.webp"
                  }
                  alt={
                    galleryImages[activeImageIndex]?.alt ||
                    product.name ||
                    "Product"
                  }
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center pointer-events-none transition-transform duration-150 ease-out will-change-transform"
                  style={{
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transform: isZoomed ? "scale(2.2)" : "scale(1)",
                  }}
                  unoptimized={Boolean(
                    (
                      galleryImages[activeImageIndex]?.src ||
                      galleryImages[0]?.src
                    )?.startsWith("/")
                  )}
                />

                {/* Magnifier Glass Icon Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxZoom(1);
                    setIsLightboxOpen(true);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-dark hover:text-primary backdrop-blur-xs border border-border shadow-xs flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-110 active:scale-95"
                  title="Click to view full image"
                  aria-label="Zoom and view full image"
                >
                  <ZoomIn size={17} />
                </button>
              </div>

              {/* Thumbnails Row */}
              {galleryImages.length > 1 && (
                <div
                  onClick={() => setShowThumbNav(true)}
                  className="relative flex items-center group/thumbs select-none"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollThumbnails("left");
                    }}
                    aria-label="Scroll thumbnails left"
                    className={`absolute -left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md border border-border text-description hover:text-primary flex items-center justify-center z-10 transition-all cursor-pointer ${showThumbNav
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
                        className={`relative w-18 h-18 md:w-20 md:h-20 overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-bg/40 ${activeImageIndex === idx
                          ? "border-primary shadow-xs"
                          : "border-border hover:border-primary/50 opacity-75 hover:opacity-100"
                          }`}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt || `Thumbnail ${idx + 1}`}
                          fill
                          sizes="90px"
                          className="object-cover"
                          unoptimized={Boolean(img.src?.startsWith("/"))}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollThumbnails("right");
                    }}
                    aria-label="Scroll thumbnails right"
                    className={`absolute -right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md border border-border text-description hover:text-primary flex items-center justify-center z-10 transition-all cursor-pointer ${showThumbNav
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-bg text-primary border border-secondary">
                    ✦ {product.categories[0].name}
                  </span>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      toggleWishlist({
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: currentPrice > 0 ? currentPrice : regularPrice,
                        regularPrice:
                          regularPrice > currentPrice ? regularPrice : undefined,
                        image:
                          product.images?.[0]?.src ||
                          "/woocommerce-placeholder.webp",
                        stockStatus: product.stock_status,
                        type: product.type,
                      });
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${isWishlisted
                      ? "bg-bg border-primary text-primary"
                      : "border-border text-description hover:border-primary hover:text-primary bg-white"
                      }`}
                    aria-label={
                      isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    <Heart
                      size={18}
                      className={isWishlisted ? "fill-primary text-primary" : ""}
                    />
                  </button>
                </div>
              </div>

              {/* Product Title */}
              {product.name && (
                <h1 className="text-2xl md:text-3xl mb-2 text-dark">
                  {product.name}
                </h1>
              )}

              {/* Price Row */}
              {!isUnconfiguredOrUnavailable &&
                (currentPrice > 0 || priceRange) && (
                  <div className="flex items-baseline gap-3 mb-2">
                    {isVariableProduct &&
                      !isAllAttributesSelected &&
                      priceRange ? (
                      priceRange.isRange ? (
                        <h3 className="text-2xl md:text-3xl font-bold text-primary">
                          Tk {priceRange.min.toLocaleString()} – Tk{" "}
                          {priceRange.max.toLocaleString()}
                        </h3>
                      ) : (
                        <h3 className="text-2xl md:text-3xl font-bold text-primary">
                          Tk {priceRange.min.toLocaleString()}
                        </h3>
                      )
                    ) : (
                      <>
                        <h3 className="text-2xl md:text-3xl font-bold text-primary">
                          Tk {currentPrice.toLocaleString()}
                        </h3>
                        {regularPrice > currentPrice && (
                          <span className="text-base text-description line-through">
                            Tk {regularPrice.toLocaleString()}
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="px-2 py-0.5 bg-bg text-accent border border-secondary rounded-none text-xs font-bold">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}

              {/* Short Description */}
              {product.short_description && (
                <div
                  className="text-sm md:text-[15px] text-description leading-relaxed mb-5 pb-3 border-b border-border"
                  dangerouslySetInnerHTML={{
                    __html: product.short_description,
                  }}
                />
              )}

              {isUnconfiguredOrUnavailable ? (
                <div className="my-6 py-5 border-t border-b border-border space-y-3">
                  <p className="text-sm md:text-base text-dark font-medium">
                    This product is currently out of stock and unavailable.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-description pt-1">
                    {product.sku && (
                      <span>
                        <strong className="text-dark">SKU:</strong> {product.sku}
                      </span>
                    )}
                    {product.categories?.[0]?.name && (
                      <span>
                        <strong className="text-dark">Category:</strong>{" "}
                        {product.categories[0].name}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Dynamic Attribute Selectors */}
                  {isVariableProduct && (
                    <div
                      ref={variantSectionRef}
                      className="space-y-4 mb-5 scroll-mt-24"
                    >
                      {variationAttributes.map((attr) => {
                        const currentVal = selectedAttributes[attr.name];
                        const isMissing = showVariantAlert && !currentVal;

                        return (
                          <div key={attr.id || attr.name}>
                            <div className="mb-2">
                              <span className="text-xs font-semibold text-dark">
                                Select {attr.name}:{" "}
                                <span className="font-bold text-primary">
                                  {currentVal || "Choose an option"}
                                </span>
                              </span>
                            </div>

                            {/* Options box */}
                            <div
                              className={`p-2 rounded-none transition-all duration-300 ${isMissing
                                ? "border-2 border-primary"
                                : "border-2 border-transparent"
                                }`}
                            >
                              <div className="flex flex-wrap gap-2">
                                {attr.options.map((rawOption) => {
                                  const option =
                                    typeof rawOption === "string"
                                      ? rawOption
                                      : (rawOption as any)?.name ||
                                      (rawOption as any)?.option ||
                                      String(rawOption);

                                  const isSelected = Boolean(
                                    currentVal &&
                                    normOptionVal(currentVal) === normOptionVal(option)
                                  );

                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() =>
                                        handleSelectAttributeOption(
                                          attr.name,
                                          option
                                        )
                                      }
                                      className={`min-w-[44px] h-9 px-3 rounded-none text-xs font-semibold flex items-center justify-center border transition-all relative cursor-pointer ${isSelected
                                        ? "bg-primary text-white border-primary shadow-xs ring-2 ring-primary/30"
                                        : "border-border text-dark bg-white hover:border-primary hover:text-primary"
                                        }`}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Clear button */}
                            {currentVal && (
                              <div className="mt-1 px-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAttributes((prev) => {
                                      const next = { ...prev };
                                      delete next[attr.name];
                                      return next;
                                    });
                                  }}
                                  className="text-[11px] font-medium text-description hover:text-primary transition-colors cursor-pointer underline"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Stock status text */}
                  {(!isVariableProduct || isAllAttributesSelected) && (
                    <div className="mb-5 flex items-center flex-wrap gap-2">
                      <span
                        className={`text-xs font-medium flex items-center gap-1.5 ${isCurrentOutOfStock ? "text-error" : "text-success"
                          }`}
                      >
                        <span className="text-base leading-none select-none">
                          •
                        </span>
                        <span>
                          {isCurrentOutOfStock ? "Out of stock" : "In stock"}
                        </span>
                      </span>

                      {/* Low stock badge */}
                      {!isCurrentOutOfStock &&
                        matchingVariation?.manage_stock === true &&
                        matchingVariation.stock_quantity !== null &&
                        matchingVariation.stock_quantity !== undefined &&
                        Number(matchingVariation.stock_quantity) > 0 &&
                        Number(matchingVariation.stock_quantity) <= 5 && (
                          <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-none font-semibold">
                            Only {matchingVariation.stock_quantity} left in
                            stock!
                          </span>
                        )}
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <span className="block text-xs font-semibold text-dark mb-2">
                      Quantity
                    </span>
                    <div className="inline-flex items-center border border-border rounded-none bg-white">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        className="w-8 h-8 flex items-center justify-center text-description hover:text-primary transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} strokeWidth={2.5} />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-dark">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 flex items-center justify-center text-description hover:text-primary transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    <div className="relative">
                      {showVariantAlert && (
                        <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 animate-in fade-in zoom-in-95 duration-200 pointer-events-none drop-shadow-md">
                          <div className="relative bg-white text-dark border border-border shadow-md px-4 py-2 rounded-none flex items-center gap-2 whitespace-nowrap text-xs sm:text-[13px] font-semibold">
                            <Info size={16} className="text-primary shrink-0" />
                            <span>Please select all variants first</span>
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-border rotate-45" />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          variant="secondary"
                          size="lg"
                          fullWidth
                          disabled={isCurrentOutOfStock}
                          onClick={handleAddToCart}
                          className={
                            justAdded
                              ? "!bg-success !text-white !border-success"
                              : ""
                          }
                          icon={
                            justAdded ? (
                              <Check size={16} strokeWidth={2.5} />
                            ) : undefined
                          }
                        >
                          {isCurrentOutOfStock
                            ? "Out of Stock"
                            : justAdded
                              ? "Added to Cart"
                              : "Add to Cart"}
                        </Button>

                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          disabled={isCurrentOutOfStock}
                          onClick={handleBuyNow}
                        >
                          {isCurrentOutOfStock ? "Out of Stock" : "Buy Now"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Delivery Meta Information Details */}
              <div className="pt-4 border-t border-border space-y-2.5 text-xs text-description">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-description shrink-0" />
                  <span>
                    Delivery Time:{" "}
                    <strong className="text-dark">3-5 days</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-description shrink-0" />
                  <span>
                    Payment:{" "}
                    <strong className="text-dark">COD Available</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Key Highlights Cards Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
          {(matchingVariation?.sku || product.sku) && (
            <div className="bg-white p-4 rounded-none border border-border flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-none bg-bg text-primary flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-[11px] text-description">SKU</p>
                <p className="text-xs font-bold text-dark truncate">
                  {matchingVariation?.sku || product.sku}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-none border border-border flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-none bg-bg text-primary flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[11px] text-description">Delivery Time</p>
              <p className="text-xs font-bold text-dark">3-5 days</p>
            </div>
          </div>

          {isVariableProduct && (
            <div className="bg-white p-4 rounded-none border border-border flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-none bg-bg text-primary flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-[11px] text-description">Variants</p>
                <p className="text-xs font-bold text-dark">
                  {product.variations?.length ||
                    product.variations_data?.length ||
                    "Available"}
                </p>
              </div>
            </div>
          )}

          {product.total_sales !== undefined &&
            product.total_sales !== null && (
              <div className="bg-white p-4 rounded-none border border-border flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-none bg-success-bg text-success flex items-center justify-center shrink-0">
                  <Check size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] text-description">Total Sold</p>
                  <p className="text-xs font-bold text-dark">
                    {product.total_sales} units
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* ── Product Description Section ── */}
        {(product.description || product.short_description) && (
          <div className="bg-white rounded-none border border-border p-6 mb-10 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Info size={17} className="text-primary" />
              <h2 className="text-base font-semibold text-dark">
                Product Description
              </h2>
            </div>
            <div className="min-h-[140px] text-sm md:text-[15px] text-description leading-relaxed">
              <p className="font-semibold text-base text-dark mb-3">
                {product.name} {product.sku ? `(${product.sku})` : ""}
              </p>
              {product.description ? (
                <div
                  className="mb-2 prose prose-sm max-w-none text-sm md:text-[15px] text-description leading-relaxed [&>p]:mb-3 [&>ul]:space-y-1.5 [&>ul]:pl-5 [&>ul]:list-disc"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : product.short_description ? (
                <div
                  className="mb-2 prose prose-sm max-w-none text-sm md:text-[15px] text-description leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: product.short_description,
                  }}
                />
              ) : null}
            </div>
          </div>
        )}

        {/* ── Related Products ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-semibold text-dark">
              Related Products
            </h2>
            <Link
              href="/shop"
              className="text-xs md:text-sm font-medium text-description hover:!text-primary inline-flex items-center gap-0.5 transition-colors group cursor-pointer"
            >
              <span className="hover:!text-primary">See More</span>
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

          <div className="text-center mt-8">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-2.5 bg-primary hover:bg-primary-hover !text-white text-xs font-bold rounded-none shadow-xs transition-colors"
            >
              See More
            </Link>
          </div>
        </div>
      </div>

      {/* ── Fullscreen Lightbox / Zoom Modal ── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between gap-3 text-white z-20 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 truncate max-w-[60%] sm:max-w-[70%]">
              <span className="text-xs sm:text-sm font-semibold text-white/90 truncate">
                {product.name}
              </span>
              <span className="text-[11px] sm:text-xs text-white/50 shrink-0">
                ({activeImageIndex + 1} / {galleryImages.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setLightboxZoom((prev) => Math.max(1, +(prev - 0.5).toFixed(1)))
                }
                disabled={lightboxZoom <= 1}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>

              <span className="text-[11px] sm:text-xs font-mono font-bold text-white/90 min-w-[38px] text-center">
                {Math.round(lightboxZoom * 100)}%
              </span>

              <button
                type="button"
                onClick={() =>
                  setLightboxZoom((prev) => Math.min(3, +(prev + 0.5).toFixed(1)))
                }
                disabled={lightboxZoom >= 3}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>

              {lightboxZoom > 1 && (
                <button
                  type="button"
                  onClick={() => setLightboxZoom(1)}
                  className="px-2 py-1 rounded-full bg-white/15 hover:bg-white/25 text-[10px] sm:text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer ml-1"
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Center Stage */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden my-2 sm:my-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsLightboxOpen(false);
              }
            }}
          >
            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-1 sm:left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                title="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            <div
              className={`relative max-w-[90vw] max-h-[70vh] aspect-square transition-transform duration-200 ease-out select-none ${lightboxZoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
              style={{
                transform: `scale(${lightboxZoom})`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxZoom((prev) => (prev > 1 ? 1 : 2));
              }}
            >
              <Image
                src={
                  galleryImages[activeImageIndex]?.src ||
                  galleryImages[0]?.src ||
                  "/woocommerce-placeholder.webp"
                }
                alt={
                  galleryImages[activeImageIndex]?.alt ||
                  product.name ||
                  "Product"
                }
                fill
                sizes="95vw"
                className="object-contain pointer-events-none"
                unoptimized={Boolean(
                  (
                    galleryImages[activeImageIndex]?.src ||
                    galleryImages[0]?.src
                  )?.startsWith("/")
                )}
                priority
              />
            </div>

            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-1 sm:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                title="Next image"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {galleryImages.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-1 z-20 no-scrollbar max-w-full shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setLightboxZoom(1);
                  }}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-none overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${activeImageIndex === idx
                    ? "border-primary scale-105 shadow-md"
                    : "border-white/30 opacity-60 hover:opacity-100"
                    }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt || `Thumbnail ${idx + 1}`}
                    fill
                    sizes="60px"
                    className="object-cover"
                    unoptimized={Boolean(img.src?.startsWith("/"))}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}