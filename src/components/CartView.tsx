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

export default function CartView() {
  const { cart, cartCount, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="w-full py-8 md:py-12 bg-white min-h-[75vh]">
      <div className="container max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* ── Top Bar / Header ── */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E8E2E5]">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={24} className="text-[#191426]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#191426]">
              Shopping Cart
            </h1>
          </div>
          <span className="text-xs sm:text-sm text-[#6F6470] font-medium">
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </span>
        </div>

        {/* ── Empty Cart State ── */}
        {cart.length === 0 ? (
          <div className="py-16 md:py-24 text-center">
            {/* Package icon in circular background */}
            <div className="w-24 h-24 rounded-full bg-[#FFF5F7] flex items-center justify-center mx-auto mb-6 text-[#E91E63]">
              <Package size={44} strokeWidth={1.5} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#191426] mb-2.5">
              Your cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6470] max-w-sm mx-auto mb-8 leading-relaxed">
              Looks like you haven&apos;t added any items to your cart yet. Start shopping to fill it up!
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3 rounded-none bg-[#E91E63] hover:bg-[#C2185B] !text-white text-xs sm:text-sm font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Column: Cart Items (8 cols on lg) ── */}
            <div className="lg:col-span-8 flex flex-col">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#191426]">
                  Cart Items ({cartCount})
                </h2>
                <span className="text-xs sm:text-sm text-[#6F6470] font-medium">
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
                      className="bg-white rounded-none border border-[#E8E2E5] p-4 sm:p-5 shadow-2xs hover:border-[#E91E63]/40 transition-colors"
                    >
                      {/* Top Row: Thumbnail + Info + Trash/Quantity */}
                      <div className="flex items-start gap-4">
                        {/* Product Thumbnail */}
                        <Link
                          href={`/product/${item.slug}`}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-none overflow-hidden bg-[#FFF5F7] border border-[#E8E2E5] shrink-0 group/img"
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
                            className="text-xs sm:text-sm font-semibold text-[#191426] hover:text-[#E91E63] transition-colors line-clamp-1 block"
                            title={item.name}
                          >
                            {item.name}
                          </Link>

                          {item.sku && (
                            <span className="text-[11px] sm:text-xs text-[#6F6470] block mt-0.5">
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
                                    className="px-2 py-0.5 rounded-none border border-[#E8E2E5] text-[10px] sm:text-[11px] font-semibold text-[#6F6470] uppercase bg-[#FFF5F7]"
                                  >
                                    {attrKey}: <span className="font-bold text-[#191426]">{attrVal}</span>
                                  </span>
                                )
                              )}
                            </div>
                          )}

                          {/* Unit Price */}
                          <div className="mt-2.5 flex items-baseline gap-1.5">
                            <span className="text-sm sm:text-base font-bold text-[#E91E63]">
                              Tk {item.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-[#6F6470] font-normal">
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
                            className="text-[#6F6470] hover:text-[#E53935] transition-colors p-1 cursor-pointer"
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
                              className="w-7 h-7 rounded-none border border-[#E91E63] text-[#E91E63] hover:bg-[#FFF5F7] flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} strokeWidth={2.5} />
                            </button>
                            <span className="min-w-8 h-7 px-1.5 rounded-none border border-[#E91E63] text-[#E91E63] text-xs font-bold flex items-center justify-center bg-white select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-none border border-[#E91E63] text-[#E91E63] hover:bg-[#FFF5F7] flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Line: Subtotal */}
                      <div className="mt-4 pt-3 border-t border-[#E8E2E5] flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-[#6F6470] font-medium">Subtotal</span>
                        <span className="font-bold text-[#E91E63] text-sm sm:text-base">
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
              <div className="bg-white rounded-none border border-[#E8E2E5] p-5 sm:p-6 shadow-2xs">
                {/* Header */}
                <div className="flex items-center gap-2 text-base font-bold text-[#191426] mb-4">
                  <Package size={18} className="text-[#6F6470]" />
                  <span>Order Summary</span>
                </div>

                {/* Items line */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-[#6F6470] mb-3">
                  <span>Items ({cartCount})</span>
                  <span className="font-semibold text-[#191426]">
                    Tk {subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-[#E8E2E5] my-4" />

                {/* Total */}
                <div className="flex items-center justify-between text-base font-bold text-[#191426] mb-5">
                  <span>Total</span>
                  <span className="text-lg text-[#E91E63]">
                    Tk {subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                  <Link
                    href="/checkout"
                    className="w-full py-3 px-4 rounded-none bg-[#E91E63] hover:bg-[#C2185B] !text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <CreditCard size={15} />
                    <span>Proceed to Checkout</span>
                  </Link>

                  <Link
                    href="/shop"
                    className="w-full py-3 px-4 rounded-none border border-[#E91E63] text-[#E91E63] hover:bg-[#FFF5F7] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Truck size={15} />
                    <span>Continue Shopping</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
