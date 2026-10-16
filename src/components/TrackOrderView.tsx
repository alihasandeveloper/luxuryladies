"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  image?: string | null;
}

interface TrackedOrder {
  id: number;
  order_number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  payment_method: string;
  shipping_city: string;
  items: OrderItem[];
}

function TrackOrderItemImage({ src, name }: { src?: string | null; name: string }) {
  const [imgSrc, setImgSrc] = useState<string>(
    src && typeof src === "string" && src.trim().length > 0
      ? src.trim()
      : "/woocommerce-placeholder.webp"
  );

  return (
    <Image
      src={imgSrc}
      alt={name || "Product"}
      fill
      unoptimized
      className="object-cover"
      onError={() => {
        if (imgSrc !== "/woocommerce-placeholder.webp") {
          setImgSrc("/woocommerce-placeholder.webp");
        }
      }}
    />
  );
}

export default function TrackOrderView() {
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [searchedId, setSearchedId] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderId.replace(/[^0-9]/g, "").trim();

    if (!clean) {
      setError("Please enter a valid numeric Order ID.");
      setOrder(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);
    setSearchedId(clean);

    try {
      const res = await fetch(`/api/track-order?orderId=${clean}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || `No order found with ID #${clean}.`);
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Unable to connect to order tracking service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for Stepper stages
  const getTimelineSteps = (status: string) => {
    const s = status.toLowerCase();
    const isCancelled = s === "cancelled" || s === "refunded" || s === "failed";

    if (isCancelled) {
      return {
        activeStep: 0,
        isCancelled: true,
        steps: [
          { label: "Order Placed", desc: "Order was created" },
          { label: "Cancelled", desc: `Order is ${s}` },
        ],
      };
    }

    let activeStep = 1; // Default: Order Placed
    if (s === "processing" || s === "on-hold") activeStep = 2;
    if (s === "shipped" || s === "in-transit" || s === "out-for-delivery") activeStep = 3;
    if (s === "completed") activeStep = 4;

    return {
      activeStep,
      isCancelled: false,
      steps: [
        { label: "Order Placed", desc: "Received by store" },
        { label: "Processing", desc: "Being prepared" },
        { label: "On The Way", desc: "Dispatched with courier" },
        { label: "Delivered", desc: "Handed over safely" },
      ],
    };
  };

  const timeline = order ? getTimelineSteps(order.status) : null;

  return (
    <div className="w-full min-h-[70vh] py-12 md:py-20 px-4 bg-bg/20">
      <div className="max-w-[720px] mx-auto">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-dark tracking-tight">
            Track Your Order
          </h1>
          <p className="text-sm md:text-base text-description mt-2">
            Search with your Order ID to check the current delivery status
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white border border-border shadow-xs p-6 md:p-8">
          <form onSubmit={handleTrack} className="space-y-3">
            <label className="block text-sm font-semibold text-dark">
              Order ID
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="text"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. 12345"
                className="grow h-12 px-4 text-sm bg-white border border-border rounded-none focus:border-primary focus:outline-hidden transition-colors placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="h-12 px-8 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-none flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                <span>Track Order</span>
              </button>
            </div>
          </form>

          {/* Inline Error Notice */}
          {error && (
            <div className="mt-5 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-none flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
              <div className="grow">
                <p className="font-medium">{error}</p>
                <p className="text-xs text-red-600/80 mt-0.5">
                  Check your confirmation SMS or email for the exact order ID number.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order Result Card */}
        {order && timeline && (
          <div className="mt-8 bg-white border border-border rounded-none shadow-xs overflow-hidden animate-fadeIn">
            {/* Header Status Bar */}
            <div className="p-6 border-b border-border bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-description uppercase tracking-wider">
                    Order
                  </span>
                  <span className="text-lg font-bold text-dark">
                    #{order.order_number}
                  </span>
                </div>
                <p className="text-xs text-description mt-0.5">
                  Placed on {new Date(order.date_created).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-sm">
                  {order.status}
                </span>
                <span className="text-base font-bold text-dark">
                  {order.currency === "BDT" ? "৳" : order.currency}{" "}
                  {parseFloat(order.total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="p-6 md:p-8 border-b border-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-description mb-6">
                Delivery Timeline
              </h2>

              {timeline.isCancelled ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-none flex items-center gap-3">
                  <XCircle size={20} className="shrink-0 text-red-600" />
                  <div>
                    <p className="font-semibold text-sm">Order Cancelled or Refunded</p>
                    <p className="text-xs mt-0.5">
                      This order is no longer being processed. Contact customer support for any questions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                  {timeline.steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isDone = stepNum < timeline.activeStep;
                    const isCurrent = stepNum === timeline.activeStep;
                    const isUpcoming = stepNum > timeline.activeStep;

                    return (
                      <div key={step.label} className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all duration-300 ${isDone
                              ? "bg-emerald-500 text-white shadow-xs"
                              : isCurrent
                                ? "bg-primary text-white shadow-md ring-4 ring-primary/20 animate-pulse"
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}
                        >
                          {isDone ? (
                            <CheckCircle2 size={18} />
                          ) : isCurrent ? (
                            <Truck size={18} />
                          ) : (
                            stepNum
                          )}
                        </div>
                        <p
                          className={`text-xs font-bold ${isCurrent
                              ? "text-primary"
                              : isDone
                                ? "text-dark"
                                : "text-slate-400"
                            }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-description mt-0.5 leading-snug">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="p-6 md:p-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-description mb-4">
                  Items in this order ({order.items.length})
                </h3>
                <div className="divide-y divide-border">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-slate-100 rounded-none border border-border relative overflow-hidden shrink-0 flex items-center justify-center">
                          <TrackOrderItemImage src={item.image} name={item.name} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-semibold text-dark truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-description mt-0.5">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs md:text-sm font-bold text-dark shrink-0">
                        {order.currency === "BDT" ? "৳" : order.currency}{" "}
                        {parseFloat(item.total).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Action */}
            <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-between text-xs text-description">
              <span>Need help with this order?</span>
              <Link
                href="/shop"
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
