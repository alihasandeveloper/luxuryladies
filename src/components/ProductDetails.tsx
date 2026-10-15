"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
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
  } catch { }
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
  const router = useRouter();
  const { addToCart } = useCart();

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

  // Check if product actually has configured variations in WooCommerce
  const hasConfiguredVariations = Boolean(
    (product.variations && product.variations.length > 0) ||
    (product.variations_data && product.variations_data.length > 0)
  );

  // Determine if product is variable and extract genuine variation attributes
  const variationAttributes = useMemo(() => {
    if (!product.attributes || product.attributes.length === 0) return [];
    if (!hasConfiguredVariations) return [];

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
  }, [product.attributes, product.variations_data, hasConfiguredVariations]);

  const isVariableProduct = hasConfiguredVariations && variationAttributes.length > 0;

  // Helper to extract default selections ONLY if explicitly set in WooCommerce backend
  const computeInitialSelections = (): Record<string, string> => {
    const initial: Record<string, string> = {};
    if (variationAttributes.length === 0) return initial;

    // Only set defaults if explicitly specified in product.default_attributes
    if (product.default_attributes && product.default_attributes.length > 0) {
      variationAttributes.forEach((attr) => {
        const def = product.default_attributes?.find(
          (d) =>
            (d.id && attr.id && d.id === attr.id) ||
            matchAttributeKey(d.name, attr.name, attr.slug)
        );
        if (def && def.option && def.option.trim() !== "") {
          const matched = findMatchingOption(attr.options, def.option);
          if (matched) {
            initial[attr.name] = matched;
          }
        }
      });
    }

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

  // Check if all variation attributes are currently selected
  const isAllAttributesSelected = useMemo(() => {
    if (!isVariableProduct) return true;
    if (variationAttributes.length === 0) return true;
    return variationAttributes.every((attr) => Boolean(selectedAttributes[attr.name]));
  }, [isVariableProduct, variationAttributes, selectedAttributes]);

  // Find currently matching variation from variations_data
  const matchingVariation = useMemo(() => {
    if (!isVariableProduct || !product.variations_data || product.variations_data.length === 0) {
      return null;
    }

    if (!isAllAttributesSelected) {
      return null;
    }

    // 1. Exact match pass: all attributes match specific variation options
    const exactMatch = product.variations_data.find((v) => {
      if (!v.attributes || v.attributes.length === 0) return false;

      return variationAttributes.every((attr) => {
        const selectedVal = selectedAttributes[attr.name];
        if (!selectedVal) return false;

        const vAttr = v.attributes.find(
          (a) =>
            (attr.id && a.id && attr.id === a.id) ||
            matchAttributeKey(a.name, attr.name, attr.slug)
        );

        if (!vAttr || !vAttr.option || vAttr.option.trim() === "") {
          return false;
        }

        const optionsToCompare = [vAttr.option];
        if (vAttr.slug && vAttr.slug !== vAttr.option) {
          optionsToCompare.push(vAttr.slug);
        }

        return Boolean(findMatchingOption(optionsToCompare, selectedVal));
      });
    });

    if (exactMatch) return exactMatch;

    // 2. Wildcard match pass: variation has "Any" for some attributes
    return (
      product.variations_data.find((v) => {
        if (!v.attributes || v.attributes.length === 0) return true;

        return variationAttributes.every((attr) => {
          const selectedVal = selectedAttributes[attr.name];
          if (!selectedVal) return false;

          const vAttr = v.attributes.find(
            (a) =>
              (attr.id && a.id && attr.id === a.id) ||
              matchAttributeKey(a.name, attr.name, attr.slug)
          );

          if (!vAttr || !vAttr.option || vAttr.option.trim() === "") {
            return true;
          }

          const optionsToCompare = [vAttr.option];
          if (vAttr.slug && vAttr.slug !== vAttr.option) {
            optionsToCompare.push(vAttr.slug);
          }

          return Boolean(findMatchingOption(optionsToCompare, selectedVal));
        });
      }) || null
    );
  }, [isVariableProduct, product.variations_data, variationAttributes, selectedAttributes, isAllAttributesSelected]);

  // When variation has its own image, automatically switch active image in gallery; revert to primary when deselected
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

  // Price range computation for variable products when not all attributes are selected
  const priceRange = useMemo(() => {
    if (!isVariableProduct || !product.variations_data || product.variations_data.length === 0) {
      return null;
    }
    const prices = product.variations_data
      .map((v) => parseFloat(v.sale_price || v.price || "0"))
      .filter((p) => p > 0);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max, isRange: min !== max };
  }, [isVariableProduct, product.variations_data]);

  // Check if any variation has available stock
  const hasAnyInStock = useMemo(() => {
    if (!isVariableProduct) {
      return product.stock_status !== "outofstock" && product.purchasable !== false;
    }
    if (!product.variations_data || product.variations_data.length === 0) {
      return product.stock_status !== "outofstock" && product.purchasable !== false;
    }
    return product.variations_data.some(
      (v) => v.stock_status !== "outofstock" && v.purchasable !== false
    );
  }, [isVariableProduct, product.variations_data, product.stock_status, product.purchasable]);

  // Calculate pricing strictly for selected variation without inheriting another variation's sale price
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
        return {
          regularPrice: finalPrice,
          currentPrice: finalPrice,
          isOnSale: false,
          discountPercent: 0,
        };
      }
    }

    const prodReg = parseFloat(product.regular_price || "0");
    const prodSale = parseFloat(product.sale_price || "0");
    const prodPrice = parseFloat(product.price || "0");

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
      isOnSale: Boolean(product.on_sale && fallbackPrice > prodSale && prodSale > 0),
      discountPercent: 0,
    };
  }, [matchingVariation, product]);

  // Accurate stock status for current selection
  const isCurrentOutOfStock = isVariableProduct
    ? isAllAttributesSelected
      ? !matchingVariation ||
      matchingVariation.stock_status === "outofstock" ||
      matchingVariation.purchasable === false
      : !hasAnyInStock
    : product.stock_status === "outofstock" || product.purchasable === false;

  // A variable product with 0 variations created in WooCommerce is unconfigured and unavailable
  const isUnconfiguredOrUnavailable =
    (product.type === "variable" && !hasConfiguredVariations) ||
    (product.purchasable === false && currentPrice <= 0);

  // Helper to check if a specific attribute option exists and has available stock across the product
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

      const thisVAttr = v.attributes.find(
        (a) =>
          (targetAttr && a.id && targetAttr.id && a.id === targetAttr.id) ||
          matchAttributeKey(a.name, attrName, targetAttr?.slug)
      );

      // Empty option means "Any" in WooCommerce
      if (!thisVAttr || !thisVAttr.option || thisVAttr.option.trim() === "") {
        return true;
      }

      const optionsToCompare = [thisVAttr.option];
      if (thisVAttr.slug && thisVAttr.slug !== thisVAttr.option) {
        optionsToCompare.push(thisVAttr.slug);
      }

      return Boolean(findMatchingOption(optionsToCompare, optionVal));
    });

    if (matchingVars.length === 0) {
      return { exists: false, inStock: false };
    }

    const inStock = matchingVars.some(
      (v) => v.stock_status !== "outofstock" && v.purchasable !== false
    );

    return { exists: true, inStock };
  };

  const handleSelectAttributeOption = (attrName: string, optionVal: string) => {
    setShowVariantAlert(false);

    const currentVal = selectedAttributes[attrName];
    const isCurrentlySelected = Boolean(
      currentVal &&
      (currentVal.toLowerCase().trim() === optionVal.toLowerCase().trim() ||
        normalizeOptionString(currentVal) === normalizeOptionString(optionVal))
    );

    // If clicking already selected option, toggle it off (deselect)
    if (isCurrentlySelected) {
      setSelectedAttributes((prev) => {
        const next = { ...prev };
        delete next[attrName];
        return next;
      });
      return;
    }

    // New candidate selections
    const newSelections: Record<string, string> = {
      ...selectedAttributes,
      [attrName]: optionVal,
    };

    // If variable product has variations_data, ensure cross-attribute compatibility
    if (product.variations_data && product.variations_data.length > 0) {
      // 1. Check if new selections match any existing variation
      const exactMatch = product.variations_data.find((v) => {
        if (!v.attributes || v.attributes.length === 0) return true;
        return v.attributes.every((vAttr) => {
          if (!vAttr.option || vAttr.option.trim() === "") return true;
          const matchedPa = variationAttributes.find(
            (pa) =>
              (vAttr.id && pa.id && vAttr.id === pa.id) ||
              matchAttributeKey(vAttr.name, pa.name, pa.slug)
          );
          const key = matchedPa ? matchedPa.name : vAttr.name;
          const selVal = newSelections[key];
          if (!selVal) return true;
          const opts = [vAttr.option];
          if (vAttr.slug && vAttr.slug !== vAttr.option) opts.push(vAttr.slug);
          return Boolean(findMatchingOption(opts, selVal));
        });
      });

      if (exactMatch) {
        setSelectedAttributes(newSelections);
        return;
      }

      // 2. If incompatible with current other selections, find compatible variation for clicked option
      const targetAttr = variationAttributes.find((a) => a.name === attrName);
      const compatibleVars = product.variations_data.filter((v) => {
        if (!v.attributes || v.attributes.length === 0) return true;
        const thisVAttr = v.attributes.find(
          (a) =>
            (targetAttr && a.id && targetAttr.id && a.id === targetAttr.id) ||
            matchAttributeKey(a.name, attrName, targetAttr?.slug)
        );
        if (!thisVAttr || !thisVAttr.option || thisVAttr.option.trim() === "") return true;
        const opts = [thisVAttr.option];
        if (thisVAttr.slug && thisVAttr.slug !== thisVAttr.option) opts.push(thisVAttr.slug);
        return Boolean(findMatchingOption(opts, optionVal));
      });

      if (compatibleVars.length > 0) {
        // Prefer an in-stock compatible variation
        const preferredVar =
          compatibleVars.find(
            (v) => v.stock_status !== "outofstock" && v.purchasable !== false
          ) || compatibleVars[0];

        const updatedSelections: Record<string, string> = { [attrName]: optionVal };
        variationAttributes.forEach((otherAttr) => {
          if (otherAttr.name === attrName) return;
          const otherVAttr = preferredVar.attributes?.find(
            (a) =>
              (otherAttr.id && a.id && otherAttr.id === a.id) ||
              matchAttributeKey(a.name, otherAttr.name, otherAttr.slug)
          );
          if (otherVAttr && otherVAttr.option && otherVAttr.option.trim() !== "") {
            const matchedOpt = findMatchingOption(otherAttr.options, otherVAttr.option);
            if (matchedOpt) {
              updatedSelections[otherAttr.name] = matchedOpt;
            }
          }
        });

        setSelectedAttributes(updatedSelections);
        return;
      }
    }

    setSelectedAttributes(newSelections);
  };

  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
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
        variantSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleAddToCart = () => {
    if (isVariableProduct && !isAllAttributesSelected) {
      triggerVariantAlert();
      return;
    }

    if (isCurrentOutOfStock) return;
    const cartItemId = `${product.id}-${matchingVariation?.id || 0}-${JSON.stringify(selectedAttributes)}`;
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
    const cartItemId = `${product.id}-${matchingVariation?.id || 0}-${JSON.stringify(selectedAttributes)}`;
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
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="w-full py-6 md:py-10">
      <div className="container max-w-[1328px] mx-auto">
        {/* ── Breadcrumb Navigation ── */}
        <nav className="flex items-center gap-1.5 md:gap-2 text-xs text-[#6F6470] mb-6 w-full lg:max-w-[calc(50%-1.5rem)] min-w-0">
          <Link href="/" className="hover:text-[#E91E63] transition-colors shrink-0">
            Home
          </Link>
          <span className="shrink-0">/</span>
          <Link href="/shop" className="hover:text-[#E91E63] transition-colors shrink-0">
            Shop
          </Link>
          {product.categories?.[0] && (
            <>
              <span className="shrink-0">/</span>
              <Link
                href={`/category/${product.categories[0].slug}`}
                className="hover:text-[#E91E63] transition-colors shrink-0 max-w-[140px] truncate"
                title={product.categories[0].name}
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <span className="shrink-0">/</span>
          {product.name && (
            <span
              className="text-[#191426] font-medium truncate min-w-0 flex-1"
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
                className="relative aspect-square w-full overflow-hidden bg-[#FFF5F7]/30 border border-[#E8E2E5] cursor-zoom-in group/zoom"
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
                  unoptimized={Boolean((galleryImages[activeImageIndex]?.src || galleryImages[0]?.src)?.startsWith("/"))}
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
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-xs border border-[#E8E2E5] shadow-xs flex items-center justify-center text-[#555] pointer-events-none transition-opacity group-hover/zoom:text-[#E91E63]">
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
                    className={`absolute -left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md border border-[#E8E2E5] text-[#444] hover:text-[#E91E63] flex items-center justify-center z-10 transition-all cursor-pointer ${showThumbNav
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
                          ? "border-[#E91E63] shadow-xs"
                          : "border-[#E8E2E5] hover:border-[#E91E63]/50 opacity-75 hover:opacity-100"
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

                  {/* Right scroll button (shown on wrapper click or hover) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollThumbnails("right");
                    }}
                    aria-label="Scroll thumbnails right"
                    className={`absolute -right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md border border-[#E8E2E5] text-[#444] hover:text-[#E91E63] flex items-center justify-center z-10 transition-all cursor-pointer ${showThumbNav
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF5F7] text-[#E91E63] border border-[#E8E2E5]">
                    ✦ {product.categories[0].name}
                  </span>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${isWishlisted
                      ? "bg-[#FFF5F7] border-[#E91E63] text-[#E91E63]"
                      : "border-[#E8E2E5] text-[#555] hover:border-[#E91E63] hover:text-[#E91E63] bg-white"
                      }`}
                    aria-label="Wishlist"
                  >
                    <Heart
                      size={18}
                      className={isWishlisted ? "fill-[#E91E63]" : ""}
                    />
                  </button>
                </div>
              </div>

              {/* Product Title */}
              {product.name && (
                <h1 className="text-2xl md:text-3xl mb-2 text-[#191426]">
                  {product.name}
                </h1>
              )}

              {/* Price Row */}
              {!isUnconfiguredOrUnavailable && (currentPrice > 0 || priceRange) && (
                <div className="flex items-baseline gap-3 mb-2">
                  {isVariableProduct && !isAllAttributesSelected && priceRange?.isRange ? (
                    <h3 className="text-2xl md:text-3xl font-bold text-[#E91E63]">
                      Tk {priceRange.min.toLocaleString()} – Tk {priceRange.max.toLocaleString()}
                    </h3>
                  ) : (
                    <>
                      <h3 className="text-2xl md:text-3xl font-bold text-[#E91E63]">
                        Tk {currentPrice.toLocaleString()}
                      </h3>
                      {regularPrice > currentPrice && (
                        <span className="text-base text-[#6F6470] line-through">
                          Tk {regularPrice.toLocaleString()}
                        </span>
                      )}
                      {discountPercent > 0 && (
                        <span className="px-2 py-0.5 bg-[#FFF5F7] text-[#FF4081] border border-[#E8E2E5] rounded-md text-xs font-bold">
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
                  className="text-sm md:text-[15px] text-[#6F6470] leading-relaxed mb-5 pb-3 border-b border-[#E8E2E5]"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              )}

              {isUnconfiguredOrUnavailable ? (
                <div className="my-6 py-5 border-t border-b border-[#E8E2E5] space-y-3">
                  <p className="text-sm md:text-base text-[#191426] font-medium">
                    This product is currently out of stock and unavailable.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#6F6470] pt-1">
                    {product.sku && (
                      <span>
                        <strong className="text-[#191426]">SKU:</strong> {product.sku}
                      </span>
                    )}
                    {product.categories?.[0]?.name && (
                      <span>
                        <strong className="text-[#191426]">Category:</strong> {product.categories[0].name}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Dynamic Attribute Selectors */}
                  {isVariableProduct && (
                    <div ref={variantSectionRef} className="space-y-4 mb-5 scroll-mt-24">
                      {variationAttributes.map((attr) => {
                        const currentVal = selectedAttributes[attr.name];
                        const isMissing = showVariantAlert && !currentVal;

                        return (
                          <div key={attr.id || attr.name}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-[#191426]">
                                Select {attr.name}:{" "}
                                <span className="font-bold text-[#E91E63]">
                                  {currentVal || "Choose an option"}
                                </span>
                              </span>
                              {currentVal && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAttributes((prev) => {
                                      const next = { ...prev };
                                      delete next[attr.name];
                                      return next;
                                    });
                                  }}
                                  className="text-[11px] font-medium text-[#6F6470] hover:text-[#E91E63] transition-colors cursor-pointer underline"
                                >
                                  Clear
                                </button>
                              )}
                            </div>

                            {/* Options box with pink outline when validation fails */}
                            <div
                              className={`p-2 rounded-md transition-all duration-300 ${isMissing
                                  ? "border-2 border-[#E91E63]"
                                  : "border-2 border-transparent"
                                }`}
                            >
                              <div className="flex flex-wrap gap-2">
                                {attr.options.map((option) => {
                                  const isSelected = Boolean(
                                    currentVal &&
                                    (currentVal.toLowerCase().trim() === option.toLowerCase().trim() ||
                                      normalizeOptionString(currentVal) === normalizeOptionString(option))
                                  );
                                  const { inStock } = getOptionStatus(attr.name, option);

                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => handleSelectAttributeOption(attr.name, option)}
                                      className={`min-w-[44px] h-9 px-3 rounded-md text-xs font-semibold flex items-center justify-center border transition-all cursor-pointer relative ${isSelected
                                          ? inStock
                                            ? "bg-[#E91E63] text-white border-[#E91E63] shadow-xs ring-2 ring-[#E91E63]/30"
                                            : "bg-[#E53935] text-white border-[#E53935] shadow-xs ring-2 ring-[#E53935]/30"
                                          : !inStock
                                            ? "border-[#E8DFE3] text-[#888] bg-[#FAF8F9] line-through hover:border-[#E91E63] hover:text-[#E91E63]"
                                            : "border-[#E8E2E5] text-[#333] bg-white hover:border-[#E91E63] hover:text-[#E91E63]"
                                        }`}
                                      title={!inStock ? `${option} (Out of stock)` : option}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Stock status text */}
                  <div className="mb-5 flex items-center">
                    <span
                      className={`text-xs font-medium flex items-center gap-1.5 ${isCurrentOutOfStock ? "text-[#E53935]" : "text-[#1E824C]"
                        }`}
                    >
                      <span className="text-base leading-none select-none">•</span>
                      <span>
                        {isCurrentOutOfStock ? "Out of stock" : "Stock available"}
                      </span>
                    </span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <span className="block text-xs font-semibold text-[#191426] mb-2">
                      Quantity
                    </span>
                    <div className="inline-flex items-center border border-[#E8E2E5] rounded-none bg-white">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        className="w-8 h-8 flex items-center justify-center text-[#6F6470] hover:text-[#E91E63] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} strokeWidth={2.5} />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-[#191426]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 flex items-center justify-center text-[#6F6470] hover:text-[#E91E63] transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    <div className="relative">
                      {/* Floating tooltip bubble matching reference image */}
                      {showVariantAlert && (
                        <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 animate-in fade-in zoom-in-95 duration-200 pointer-events-none drop-shadow-md">
                          <div className="relative bg-white text-[#191426] border border-[#E8E2E5] shadow-md px-4 py-2 rounded-none flex items-center gap-2 whitespace-nowrap text-xs sm:text-[13px] font-semibold">
                            <Info size={16} className="text-[#E91E63] shrink-0" />
                            <span>Please select all variants first</span>
                            {/* Downward pointing arrow */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#E8E2E5] rotate-45" />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          disabled={isCurrentOutOfStock}
                          onClick={handleAddToCart}
                          className={`w-full py-3 text-xs font-bold tracking-wide transition-all duration-200 ${isCurrentOutOfStock
                              ? "bg-white text-[#E91E63] border-2 border-[#E91E63] opacity-50 cursor-not-allowed"
                              : justAdded
                                ? "bg-[#2E7D32] text-white border-2 border-[#2E7D32] shadow-xs"
                                : "bg-white hover:bg-[#FFF5F7] text-[#E91E63] border-2 border-[#E91E63] cursor-pointer active:scale-[0.99]"
                            }`}
                        >
                          {isCurrentOutOfStock ? (
                            "Out of Stock"
                          ) : justAdded ? (
                            <span className="flex items-center justify-center gap-1.5 animate-in zoom-in-95">
                              <Check size={16} strokeWidth={2.5} />
                              Added to Cart
                            </span>
                          ) : (
                            "Add to Cart"
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isCurrentOutOfStock}
                          onClick={handleBuyNow}
                          className={`w-full py-3 text-xs font-bold tracking-wide shadow-xs transition-all duration-200 !bg-[#E91E63] !text-white ${isCurrentOutOfStock
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:!bg-[#C2185B] cursor-pointer active:scale-[0.99]"
                            }`}
                        >
                          {isCurrentOutOfStock ? "Out of Stock" : "Buy Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Delivery Meta Information Details */}
              <div className="pt-4 border-t border-[#E8E2E5] space-y-2.5 text-xs text-[#6F6470]">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#6F6470] shrink-0" />
                  <span>
                    Delivery Time:{" "}
                    <strong className="text-[#191426]">3-5 days</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#6F6470] shrink-0" />
                  <span>
                    Payment:{" "}
                    <strong className="text-[#191426]">COD Available</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Key Highlights Cards Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
          {(matchingVariation?.sku || product.sku) && (
            <div className="bg-white p-4 rounded-none border border-[#E8E2E5] flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-none bg-[#FFF5F7] text-[#E91E63] flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-[11px] text-[#6F6470]">SKU</p>
                <p className="text-xs font-bold text-[#191426] truncate">
                  {matchingVariation?.sku || product.sku}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-none border border-[#E8E2E5] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-none bg-[#FFF5F7] text-[#E91E63] flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[11px] text-[#6F6470]">Delivery Time</p>
              <p className="text-xs font-bold text-[#191426]">3-5 days</p>
            </div>
          </div>

          {isVariableProduct && (
            <div className="bg-white p-4 rounded-none border border-[#E8E2E5] flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-none bg-[#FFF5F7] text-[#E91E63] flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-[11px] text-[#6F6470]">Variants</p>
                <p className="text-xs font-bold text-[#191426]">
                  {product.variations_data?.length || "Available"}
                </p>
              </div>
            </div>
          )}

          {product.total_sales !== undefined && product.total_sales !== null && (
            <div className="bg-white p-4 rounded-none border border-[#E8E2E5] flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-none bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
                <Check size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] text-[#6F6470]">Total Sold</p>
                <p className="text-xs font-bold text-[#191426]">
                  {product.total_sales} units
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Product Description Section ── */}
        {(product.description || product.short_description) && (
          <div className="bg-white rounded-none border border-[#E8E2E5] p-6 mb-10 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8E2E5]">
              <Info size={17} className="text-[#E91E63]" />
              <h2 className="text-base font-semibold text-[#191426]">
                Product Description
              </h2>
            </div>
            <div className="min-h-[140px] text-sm md:text-[15px] text-[#6F6470] leading-relaxed">
              <p className="font-semibold text-base text-[#191426] mb-3">
                {product.name} {product.sku ? `(${product.sku})` : ""}
              </p>
              {product.description ? (
                <div
                  className="mb-2 prose prose-sm max-w-none text-sm md:text-[15px] text-[#6F6470] leading-relaxed [&>p]:mb-3 [&>ul]:space-y-1.5 [&>ul]:pl-5 [&>ul]:list-disc"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : product.short_description ? (
                <div
                  className="mb-2 prose prose-sm max-w-none text-sm md:text-[15px] text-[#6F6470] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              ) : null}
            </div>
          </div>
        )}

        {/* ── Related Products ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-semibold text-[#191426]">
              Related Products
            </h2>
            <Link
              href="/shop"
              className="text-xs md:text-sm font-medium text-[#6F6470] hover:!text-[#E91E63] inline-flex items-center gap-0.5 transition-colors group cursor-pointer"
            >
              <span className="hover:!text-[#E91E63]">See More</span>
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
              className="inline-flex items-center justify-center px-8 py-2.5 bg-[#E91E63] hover:bg-[#C2185B] !text-white text-xs font-bold rounded-none shadow-xs transition-colors"
            >
              See More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
