"use client";

import React, { useState } from "react";
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
  Tag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Button from "@/components/Button";

export default function CartView() {
  const {
    cart,
    cartCount,
    subtotal,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) {
      setCouponMessage({ text: "Please enter a coupon code.", isError: true });
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
      const res = await applyCoupon(code);
      if (res.success) {
        toast.success(res.message);
        setCouponInput("");
        setCouponMessage({ text: res.message, isError: false });
      } else {
        toast.error(res.message);
        setCouponMessage({ text: res.message, isError: true });
      }
    } catch {
      toast.error("Failed to apply coupon.");
      setCouponMessage({ text: "Failed to apply coupon.", isError: true });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - discount);

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
                      className="bg-white rounded-none border border-border p-4 sm:p-5 shadow-sm hover:shadow-md transition-all"
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
                                    className="px-2 py-0.5 rounded-sm border border-secondary text-[10px] sm:text-[11px] font-semibold text-description uppercase bg-bg"
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
              <div className="bg-white rounded-none border border-border p-5 sm:p-6 shadow-sm">
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

                {/* Coupon discount line (if applied) */}
                {appliedCoupon && discount > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm text-success mb-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Tag size={13} className="text-success shrink-0" />
                      <span>Coupon ({appliedCoupon.code})</span>
                    </span>
                    <span className="font-bold text-success">
                      -Tk {discount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Coupon Input / Status Box */}
                <div className="pt-2 pb-3 mb-2 border-t border-border">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-success-bg border border-success/30 rounded-none px-3 py-2 text-xs">
                      <div className="flex items-center gap-2 text-success">
                        <Tag size={14} className="text-success shrink-0" />
                        <span>
                          Code <strong>{appliedCoupon.code}</strong> applied (-Tk {discount.toFixed(2)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          removeCoupon();
                          setCouponMessage(null);
                          toast.info("Coupon removed.");
                        }}
                        className="text-description hover:text-error font-bold ml-2 cursor-pointer p-0.5"
                        title="Remove coupon"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={couponInput}
                          disabled={isApplyingCoupon}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            if (couponMessage) setCouponMessage(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Coupon code"
                          className="flex-1 h-9 px-3 rounded-none border border-border text-xs text-dark placeholder:text-description uppercase tracking-wider focus:outline-none focus:border-primary disabled:bg-gray-50"
                        />
                        <button
                          type="button"
                          disabled={isApplyingCoupon}
                          onClick={() => handleApplyCoupon()}
                          className="h-9 px-4 rounded-none bg-dark hover:bg-dark/90 disabled:opacity-60 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        >
                          {isApplyingCoupon ? "Applying..." : "Apply"}
                        </button>
                      </div>
                      {couponMessage && (
                        <p className={`text-xs mt-1.5 ${couponMessage.isError ? "text-error" : "text-success"}`}>
                          {couponMessage.text}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-border my-3" />

                {/* Total */}
                <div className="flex items-center justify-between text-base font-bold text-dark mb-5">
                  <span>Total</span>
                  <span className="text-lg text-primary">
                    Tk {finalTotal.toFixed(2)}
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
