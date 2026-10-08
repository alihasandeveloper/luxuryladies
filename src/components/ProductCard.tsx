"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { WooCommerceProduct } from "@/types/woocommerce";

interface ProductCardProps {
  product: WooCommerceProduct;
  showWishlist?: boolean;
}

export default function ProductCard({
  product,
  showWishlist = false,
}: ProductCardProps) {
  const regular = parseFloat(product.regular_price || product.price);
  const current = parseFloat(product.sale_price || product.price);
  const discountPercent =
    product.on_sale && regular > current
      ? Math.round(((regular - current) / regular) * 100)
      : 0;

  const isOutOfStock = product.stock_status === "outofstock";
  const badgeMeta = product.meta_data?.find((m) => m.key === "_badge")?.value;
  const initialImage = product.images?.[0]?.src || "/woocommerce-placeholder.webp";
  const [imgSrc, setImgSrc] = useState(initialImage);

  useEffect(() => {
    setImgSrc(product.images?.[0]?.src || "/woocommerce-placeholder.webp");
  }, [product.images]);

  return (
    <div className={`group relative bg-white overflow-hidden md:shadow-lg hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col ${isOutOfStock ? "opacity-90" : ""}`}>
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#f7f7f7]">
        <Link href={`/product/${product.slug}`} className="relative block w-full h-full overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.images?.[0]?.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isOutOfStock ? "grayscale-[30%]" : ""}`}
            onError={() => setImgSrc("/woocommerce-placeholder.webp")}
          />
        </Link>

        {/* Out of Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-2 left-2 z-10 bg-[#1e1e1e]/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-sm shadow-xs">
            Out of Stock
          </span>
        ) : badgeMeta ? (
          /* Limited Offer Badge (Green badge on top-left) */
          <span className="absolute top-2 left-2 z-10 bg-[#28a745] text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs">
            {badgeMeta}
          </span>
        ) : null}

        {/* Wishlist Button (top-right round icon) */}
        {showWishlist && (
          <button
            type="button"
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-[var(--color-primary)] flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Heart size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Product Info below image */}
      <div className="p-3 flex flex-col items-start text-left">
        {/* Product Name */}
        <Link
          href={`/product/${product.slug}`}
          className="product-title text-xs md:text-sm font-medium line-clamp-1 leading-snug w-full"
        >
          {product.name}
        </Link>

        {/* Pricing Row with Cart Button */}
        <div className="mt-2 flex items-center justify-between w-full">
          {/* Price Stack: Current price above, regular + discount below */}
          <div className="flex flex-col">
            {/* Sale / Current Price */}
            <span className="text-sm md:text-base font-semibold text-[var(--color-primary)] leading-tight">
              Tk {parseFloat(product.price).toLocaleString()}
            </span>

            {/* Regular Price & Discount Percent */}
            {product.on_sale && product.regular_price && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] md:text-xs text-[#6c757d] line-through font-normal">
                  Tk {parseFloat(product.regular_price).toLocaleString()}
                </span>
                {discountPercent > 0 && (
                  <span className="text-[11px] md:text-xs font-medium text-red-600">
                    -{discountPercent}%
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Add to Cart Round Button (Disabled styling if out of stock) */}
          <button
            type="button"
            disabled={isOutOfStock}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm flex-shrink-0 ${
              isOutOfStock
                ? "bg-[#e2d8dc] text-[#8C7B82] cursor-not-allowed opacity-70"
                : "bg-[var(--color-primary)] text-white hover:scale-110 active:scale-95 cursor-pointer"
            }`}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
          >
            <ShoppingCart size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Animated bottom pink border on hover: 0 width to full width */}
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--color-primary)] transition-all duration-300 ease-out group-hover:w-full" />
    </div>
  );
}
