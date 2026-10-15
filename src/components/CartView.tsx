"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  CreditCard,
  Truck,
  Package,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Button from "@/components/Button";

export default function CartView() {
  const { cart, cartCount, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="w-full py-8 md:py-12 bg-bg/20 min-h-[75vh]">
      <div className="container max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* ── Top Bar / Header ── */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={24} className="text-dark" />
            <h1 className="text-xl sm:text-2xl font-bold text-dark">
              Shopping Cart
            </h1>
          </div>
          <span className="text-xs sm:text-sm text-description font-medium">
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </span>
        </div>

        {/* ── Empty Cart State ── */}
        {cart.length === 0 ? (
          <div className="py-16 md:py-24 text-center">
            {/* Package icon in circular background */}
            <div className="w-24 h-24 rounded-full bg-bg flex items-center justify-center mx-auto mb-6 text-primary">
              <Package size={44} strokeWidth={1.5} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-dark mb-2.5">
              Your cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-description max-w-sm mx-auto mb-8 leading-relaxed">
              Looks like you haven&apos;t added any items to your cart yet. Start shopping to fill it up!
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Column: Cart Items (8 cols on lg) ── */}
            <div className="lg:col-span-8 flex flex-col">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-dark">
                  Cart Items ({cartCount})
                </h2>
                <span className="text-xs sm:text-sm text-description font-medium">
                  Total: Tk {subtotal.toFixed(2)}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {cart.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  const hasAttributes =
                    item.selectedAttributes &&
                    Object.keys(item.selectedAttributes).length > 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-none p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Top Row: Thumbnail + Info + Trash/Quantity */}
                      <div className="flex items-start gap-4">
                        {/* Product Thumbnail */}
                        <Link
                          href={`/product/${item.slug}`}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-none overflow-hidden bg-bg border border-border shrink-0 group/img"
                        >
                          <Image
                            src={item.image || "/woocommerce-placeholder.webp"}
                            alt={item.name}
                            fill
                            sizes="100px"
                            className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                            unoptimized={Boolean(!item.image || item.image.startsWith("/"))}
                          />
                        </Link>

                        {/* Title, SKU, Attributes, Unit Price */}
                        <div className="flex-1 min-w-0 pr-2">
                          <Link
                            href={`/product/${item.slug}`}
                            className="text-xs sm:text-sm font-semibold text-dark hover:text-primary transition-colors line-clamp-1 block"
                            title={item.name}
                          >
                            {item.name}
                          </Link>

                          {item.sku && (
                            <span className="text-[11px] sm:text-xs text-description block mt-0.5">
                              SKU: {item.sku}
                            </span>
                          )}

                          {/* Attribute Badges (e.g. SIZE: 35, COLOR: Black) */}
                          {hasAttributes && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {Object.entries(item.selectedAttributes!).map(
                                ([attrKey, attrVal]) => (
                                  <span
                                    key={attrKey}
                                    className="px-2 py-0.5 rounded-none border border-border text-[10px] sm:text-[11px] font-semibold text-description uppercase bg-bg"
                                  >
                                    {attrKey}: <span className="font-bold text-dark">{attrVal}</span>
                                  </span>
                                )
                              )}
                            </div>
                          )}

                          {/* Unit Price */}
                          <div className="mt-2.5 flex items-baseline gap-1.5">
                            <span className="text-sm sm:text-base font-bold text-primary">
                              Tk {item.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-description font-normal">
                              each
                            </span>
                          </div>
                        </div>

                        {/* Trash Icon & Quantity Stepper */}
                        <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                          {/* Trash Button */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-description hover:text-error transition-colors p-1 cursor-pointer"
                            aria-label={`Remove ${item.name} from cart`}
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>

                          {/* Quantity Stepper: [-] [1] [+] */}
                          <div className="flex items-center gap-1.5 mt-auto pt-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-none border border-primary text-primary hover:bg-bg flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} strokeWidth={2.5} />
                            </button>
                            <span className="min-w-8 h-7 px-1.5 rounded-none border border-primary text-primary text-xs font-bold flex items-center justify-center bg-white select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-none border border-primary text-primary hover:bg-bg flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Line: Subtotal */}
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-description font-medium">Subtotal</span>
                        <span className="font-bold text-primary text-sm sm:text-base">
                          Tk {lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Right Column: Order Summary (4 cols on lg) ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-[150px] flex flex-col">
              <div className="bg-white rounded-none p-5 sm:p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-2 text-base font-bold text-dark mb-4">
                  <Package size={18} className="text-description" />
                  <span>Order Summary</span>
                </div>

                {/* Items line */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-description mb-3">
                  <span>Items ({cartCount})</span>
                  <span className="font-semibold text-dark">
                    Tk {subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-4" />

                {/* Total */}
                <div className="flex items-center justify-between text-base font-bold text-dark mb-5">
                  <span>Total</span>
                  <span className="text-lg text-primary">
                    Tk {subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                  <Button
                    variant="primary"
                    href="/checkout"
                    fullWidth
                    size="lg"
                    icon={<CreditCard size={15} />}
                  >
                    Proceed to Checkout
                  </Button>

                  <Button
                    variant="secondary"
                    href="/shop"
                    fullWidth
                    size="lg"
                    icon={<Truck size={15} />}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
