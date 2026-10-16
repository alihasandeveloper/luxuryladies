"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingBag, Trash2, ArrowRight, Check, Package } from "lucide-react";
import { toast } from "sonner";
import { WishlistItem } from "@/types/wishlist";
import Button from "@/components/Button";

function WishlistItemImage({ src, alt }: { src?: string | null; alt: string }) {
  const [imgSrc, setImgSrc] = useState(
    src && typeof src === "string" && src.trim().length > 0
      ? src.trim()
      : "/woocommerce-placeholder.webp"
  );

  return (
    <Image
      src={imgSrc}
      alt={alt || "Product image"}
      fill
      unoptimized={Boolean(
        typeof imgSrc === "string" &&
          (imgSrc.startsWith("/") ||
            imgSrc.includes("localhost") ||
            imgSrc.includes("headless.local"))
      )}
      className="object-cover"
      onError={() => {
        if (imgSrc !== "/woocommerce-placeholder.webp") {
          setImgSrc("/woocommerce-placeholder.webp");
        }
      }}
    />
  );
}

export default function WishlistView() {
  const router = useRouter();
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState<number | null>(null);

  const handleAddToCart = (item: WishlistItem) => {
    // If variable product, redirect to product details to select size/color
    if (item.type === "variable") {
      router.push(`/product/${item.slug}`);
      return;
    }

    setAddingId(item.id);

    addToCart({
      id: `${item.id}-0-{}`,
      productId: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      regularPrice: item.regularPrice,
      image: item.image || "/woocommerce-placeholder.webp",
      stockStatus: item.stockStatus === "outofstock" ? "outofstock" : "instock",
    });

    toast.success(`${item.name} added to cart!`, {
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart"),
      },
    });

    setTimeout(() => {
      setAddingId(null);
    }, 1200);
  };

  return (
    <div className="w-full py-8 md:py-12 bg-bg/20 min-h-[75vh]">
      <div className="container max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* ── Top Bar / Header ── */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Heart size={24} className="text-dark" strokeWidth={1.75} />
            <h1 className="text-xl sm:text-2xl font-bold text-dark">
              My Wishlist
            </h1>
          </div>
          <span className="text-xs sm:text-sm text-description font-medium">
            {wishlistCount} {wishlistCount === 1 ? "item" : "items"}
          </span>
        </div>

        {/* ── Empty Wishlist State (styled exactly like Cart) ── */}
        {wishlist.length === 0 ? (
          <div className="py-16 md:py-24 text-center">
            {/* Heart icon in circular background */}
            <div className="w-24 h-24 rounded-full bg-bg flex items-center justify-center mx-auto mb-6 text-primary">
              <Heart size={44} strokeWidth={1.5} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-dark mb-2.5">
              Your wishlist is empty
            </h2>
            <p className="text-xs sm:text-sm text-description max-w-sm mx-auto mb-8 leading-relaxed">
              Looks like you haven&apos;t added any items to your wishlist yet. Start shopping to fill it up!
            </p>

            <Button
              variant="primary"
              href="/shop"
              size="lg"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-end gap-3 mb-4">
              <button
                type="button"
                onClick={clearWishlist}
                className="text-xs text-description hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear Wishlist
              </button>
              <Link
                href="/shop"
                className="px-4 py-2 bg-white hover:bg-bg border border-border text-xs font-semibold text-dark uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Wishlist Items List (Desktop Table + Mobile Cards) */}
            <div className="bg-white border border-border shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-description">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {wishlist.map((item) => {
                  const isOutOfStock = item.stockStatus === "outofstock";
                  const isAdding = addingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Product Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/product/${item.slug}`}
                            className="w-16 h-16 bg-slate-100 relative shrink-0 border border-border overflow-hidden block"
                          >
                            <WishlistItemImage src={item.image} alt={item.name} />
                          </Link>
                          <div className="min-w-0">
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-sm font-semibold text-dark hover:text-primary transition-colors line-clamp-1 block"
                            >
                              {item.name}
                            </Link>
                            <span className="text-[11px] text-description uppercase tracking-wider mt-0.5 block">
                              {item.type === "variable" ? "Select Size / Color" : "Ready to Wear"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-semibold text-primary">
                        Tk {item.price ? item.price.toLocaleString() : "0"}
                        {item.regularPrice && item.regularPrice > item.price && (
                          <span className="ml-2 text-xs text-description line-through font-normal">
                            Tk {item.regularPrice.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td className="py-4 px-4">
                        {isOutOfStock ? (
                          <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {isOutOfStock ? (
                            <button
                              disabled
                              className="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider cursor-not-allowed"
                            >
                              Out of Stock
                            </button>
                          ) : item.type === "variable" ? (
                            <Link
                              href={`/product/${item.slug}`}
                              className="px-4 py-2 bg-primary hover:bg-primary-hover !text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>Select Options</span>
                              <ArrowRight size={13} />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item)}
                              disabled={isAdding}
                              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                            >
                              {isAdding ? (
                                <>
                                  <Check size={14} />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={14} />
                                  <span>Add to Cart</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            aria-label="Remove item"
                            title="Remove from wishlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="block md:hidden divide-y divide-border">
            {wishlist.map((item) => {
              const isOutOfStock = item.stockStatus === "outofstock";
              const isAdding = addingId === item.id;

              return (
                <div key={item.id} className="p-4 flex gap-3.5">
                  <Link
                    href={`/product/${item.slug}`}
                    className="w-20 h-20 bg-slate-100 relative shrink-0 border border-border overflow-hidden block"
                  >
                    <WishlistItemImage src={item.image} alt={item.name} />
                  </Link>

                  <div className="grow min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-xs font-semibold text-dark hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer shrink-0 p-1"
                          aria-label="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-xs font-bold text-primary">
                          Tk {item.price ? item.price.toLocaleString() : "0"}
                        </span>
                        {item.regularPrice && item.regularPrice > item.price && (
                          <span className="text-[11px] text-description line-through">
                            Tk {item.regularPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      {isOutOfStock ? (
                        <span className="text-[10px] font-semibold text-red-600">
                          Out of Stock
                        </span>
                      ) : item.type === "variable" ? (
                        <Link
                          href={`/product/${item.slug}`}
                          className="w-full py-1.5 px-3 bg-primary hover:bg-primary-hover !text-white text-[11px] font-bold uppercase tracking-wider text-center block transition-colors"
                        >
                          Select Options
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          disabled={isAdding}
                          className="w-full py-1.5 px-3 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold uppercase tracking-wider text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {isAdding ? (
                            <>
                              <Check size={13} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={13} />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
