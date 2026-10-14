"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  Package,
  ArrowLeft,
  AlertCircle,
  Phone,
  MapPin,
  User,
  Mail,
  FileText,
  Tag,
  Printer,
  ShoppingBag,
  ChevronRight,
  Clock,
  Wallet,
  Search,
  ChevronDown,
  Check,
  X,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import {
  WooCommercePaymentGateway,
  WooCommerceShippingMethod,
  WooCommerceState,
} from "@/types/woocommerce";

interface PlacedOrderInfo {
  orderId: number | string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName?: string;
    phone: string;
    altPhone?: string;
    email?: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
    notes?: string;
  };
  paymentMethod: string;
  paymentMethodTitle: string;
  shippingMethodTitle: string;
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
  items: any[];
  placedAt: string;
}

interface CheckoutViewProps {
  initialGateways?: WooCommercePaymentGateway[];
  initialShippingMethods?: WooCommerceShippingMethod[];
  initialStates?: WooCommerceState[];
  initialCountry?: string;
}

export default function CheckoutView({
  initialGateways = [],
  initialShippingMethods = [],
  initialStates = [],
  initialCountry = "BD",
}: CheckoutViewProps) {
  const {
    cart,
    cartCount,
    subtotal,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  // Dynamic backend data
  const [gateways, setGateways] = useState<WooCommercePaymentGateway[]>(initialGateways);
  const [shippingMethods, setShippingMethods] = useState<WooCommerceShippingMethod[]>(initialShippingMethods);
  const [states, setStates] = useState<WooCommerceState[]>(initialStates);

  const [isLoadingGateways, setIsLoadingGateways] = useState<boolean>(initialGateways.length === 0);
  const [isLoadingShipping, setIsLoadingShipping] = useState<boolean>(initialShippingMethods.length === 0);

  // Selected methods from backend
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    initialGateways.length > 0 ? initialGateways[0].id : ""
  );
  const [selectedShippingId, setSelectedShippingId] = useState<string>(
    initialShippingMethods.length > 0 ? initialShippingMethods[0].id : ""
  );

  // Standard WooCommerce billing & delivery fields
  const [formData, setFormData] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    phone: "",
    altPhone: "",
    email: "",
    country: initialCountry || "BD",
    district: "",
    state: "",
    city: "",
    address: "",
    address2: "",
    postalCode: "",
    notes: "",
  });

  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderInfo | null>(null);

  // Searchable District dropdown state
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");
  const districtRef = useRef<HTMLDivElement>(null);

  // Close district dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) {
        setIsDistrictOpen(false);
        setDistrictSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStates = useMemo(() => {
    if (!districtSearch.trim()) return states;
    const q = districtSearch.trim().toLowerCase();
    return states.filter((st) => st.name.toLowerCase().includes(q));
  }, [states, districtSearch]);

  const handleSelectDistrict = (districtName: string) => {
    setFormData((prev) => ({
      ...prev,
      district: districtName,
      state: districtName,
      city: districtName,
    }));
    setDistrictSearch("");
    setIsDistrictOpen(false);
    if (errors.district) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.district;
        return next;
      });
    }
  };

  // Fetch Payment Gateways from backend if not preloaded
  useEffect(() => {
    if (initialGateways && initialGateways.length > 0) {
      setGateways(initialGateways);
      if (!selectedPaymentId) {
        setSelectedPaymentId(initialGateways[0].id);
      }
      setIsLoadingGateways(false);
      return;
    }

    let isMounted = true;
    setIsLoadingGateways(true);
    fetch("/api/payment-gateways")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.gateways) && data.gateways.length > 0) {
          setGateways(data.gateways);
          setSelectedPaymentId((prev) => (prev ? prev : data.gateways[0].id));
        }
      })
      .catch((err) => console.error("Error loading payment gateways:", err))
      .finally(() => {
        if (isMounted) setIsLoadingGateways(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialGateways, selectedPaymentId]);

  // Fetch Shipping options dynamically based on selected District / State
  const selectedDistrict = formData.district || formData.state || "";

  useEffect(() => {
    if (!selectedDistrict) {
      setShippingMethods([]);
      setSelectedShippingId("");
      setIsLoadingShipping(false);
      return;
    }

    let isMounted = true;
    setIsLoadingShipping(true);

    fetch(
      `/api/shipping-methods?district=${encodeURIComponent(selectedDistrict)}&country=${encodeURIComponent(
        formData.country || initialCountry || ""
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.shippingMethods) && data.shippingMethods.length > 0) {
          setShippingMethods(data.shippingMethods);
          setSelectedShippingId((prev) => {
            const stillValid = data.shippingMethods.some((m: WooCommerceShippingMethod) => m.id === prev);
            return stillValid ? prev : data.shippingMethods[0].id;
          });
        } else {
          setShippingMethods([]);
          setSelectedShippingId("");
        }
      })
      .catch((err) => {
        console.error("Error loading Shipping options for district:", err);
        setShippingMethods([]);
        setSelectedShippingId("");
      })
      .finally(() => {
        if (isMounted) setIsLoadingShipping(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDistrict, formData.country, initialCountry]);

  // Fetch Country States / Districts from backend if not preloaded
  useEffect(() => {
    if (initialStates && initialStates.length > 0) {
      setStates(initialStates);
      return;
    }

    let isMounted = true;
    const countryParam = formData.country || initialCountry || "";
    fetch(`/api/country-states${countryParam ? `?country=${encodeURIComponent(countryParam)}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.states) && data.states.length > 0) {
          setStates(data.states);
          if (data.country && !formData.country) {
            setFormData((prev) => ({ ...prev, country: data.country }));
          }
        }
      })
      .catch((err) => console.error("Error loading states:", err));

    return () => {
      isMounted = false;
    };
  }, [initialStates, formData.country, initialCountry]);

  // Active Shipping & Calculations
  const activeShippingMethod =
    shippingMethods.find((m) => m.id === selectedShippingId) || shippingMethods[0];
  const shippingCost = activeShippingMethod ? activeShippingMethod.cost : 0;
  const grandTotal = Math.max(0, subtotal - discount + shippingCost);

  // Active Payment Method
  const activePaymentGateway =
    gateways.find((g) => g.id === selectedPaymentId) || gateways[0];

  // Form input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "fullName") {
        const parts = value.trim().split(" ");
        updated.firstName = parts[0] || value;
        updated.lastName = parts.slice(1).join(" ") || "";
      }
      if (name === "district") {
        updated.state = value;
        updated.city = value;
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Coupon handling
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }
    setIsApplyingCoupon(true);
    try {
      const res = await applyCoupon(code);
      if (res.success) {
        toast.success(res.message);
        setCouponInput("");
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to verify coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const nameVal = (formData.fullName || formData.firstName).trim();
    if (!nameVal) {
      newErrors.fullName = "Full name is required";
    }

    let cleanPhone = formData.phone.trim().replace(/[\s-]/g, "");
    if (/^1[3-9]\d{8}$/.test(cleanPhone)) {
      cleanPhone = "0" + cleanPhone;
    }
    const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
    if (!cleanPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!bdPhoneRegex.test(cleanPhone)) {
      newErrors.phone = "Enter a valid Bangladeshi number (e.g. 017XXXXXXXX)";
    }

    if (!formData.district?.trim()) {
      newErrors.district = "District is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Delivery address is required";
    }

    if (shippingMethods.length === 0) {
      newErrors.shipping = "No shipping options available for the selected district";
    } else if (!selectedShippingId) {
      newErrors.shipping = "Please select a shipping method";
    }

    if (!selectedPaymentId && gateways.length > 0) {
      newErrors.payment = "Please select a payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Order submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please complete all required fields.");
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      let formattedPhone = formData.phone.trim().replace(/[\s-]/g, "");
      if (/^1[3-9]\d{8}$/.test(formattedPhone)) {
        formattedPhone = "0" + formattedPhone;
      }

      const orderPayload = {
        customer: {
          ...formData,
          phone: formattedPhone,
          fullName: formData.fullName || formData.firstName,
          firstName: formData.firstName || (formData.fullName ? formData.fullName.split(" ")[0] : "Customer"),
          lastName: formData.lastName || (formData.fullName ? formData.fullName.split(" ").slice(1).join(" ") : ""),
          district: formData.district || formData.state || "Dhaka",
          state: formData.district || formData.state || "Dhaka",
          city: formData.district || formData.city || "Dhaka",
        },
        items: cart,
        shippingMethod: activeShippingMethod
          ? {
            id: activeShippingMethod.id,
            method_id: activeShippingMethod.method_id,
            title: activeShippingMethod.title,
            cost: activeShippingMethod.cost,
          }
          : undefined,
        shippingCost,
        paymentMethod: activePaymentGateway ? activePaymentGateway.id : selectedPaymentId,
        paymentMethodTitle: activePaymentGateway ? activePaymentGateway.title : "Payment",
        coupon: appliedCoupon
          ? {
            code: appliedCoupon.code,
            discountAmount: discount,
          }
          : undefined,
        total: grandTotal,
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to place order. Please try again.");
      }

      // Success
      const completedOrder: PlacedOrderInfo = {
        orderId: data.orderId,
        orderNumber: data.orderNumber || `LL-${data.orderId}`,
        customer: { ...formData },
        paymentMethod: activePaymentGateway ? activePaymentGateway.id : selectedPaymentId,
        paymentMethodTitle: activePaymentGateway ? activePaymentGateway.title : "Payment",
        shippingMethodTitle: activeShippingMethod ? activeShippingMethod.title : "Standard Shipping",
        shippingCost,
        subtotal,
        discount,
        total: grandTotal,
        items: [...cart],
        placedAt: new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };

      clearCart();
      setPlacedOrder(completedOrder);
      toast.success("Your order has been placed successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Order submit failed:", err);
      toast.error(err.message || "Failed to submit order. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // VIEW: ORDER SUCCESS CONFIRMATION
  // ══════════════════════════════════════════════════════════════
  if (placedOrder) {
    return (
      <div className="w-full py-10 md:py-16 bg-[#FFFDFE] min-h-[80vh]">
        <div className="container max-w-[920px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-md border border-gray-200/80 p-6 sm:p-10 shadow-sm text-center mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ff0080] via-[#ff2894] to-[#ff0080]" />

            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <CheckCircle2 size={44} strokeWidth={2.2} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100/70 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
              Order Confirmed
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] mb-2 tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
              Your order has been received and is being processed according to your selected shipping and Payment options.
            </p>

            <div className="inline-flex items-center gap-3 bg-[#FFF5F8] border border-[#EDE0E5] rounded-md px-5 py-3 mt-6 text-sm">
              <span className="text-slate-500 font-medium">Order Number:</span>
              <span className="font-extrabold text-[#ff0080] text-base tracking-wide font-mono">
                {placedOrder.orderNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-md border border-gray-200/80 p-6 shadow-2xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-[#ff0080]" />
                <span>Delivery Address</span>
              </h2>
              <div className="space-y-1.5 text-sm text-[#1e293b]">
                <p className="font-bold text-base text-slate-900">
                  {placedOrder.customer.firstName} {placedOrder.customer.lastName}
                </p>
                <p className="text-slate-600 flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>{placedOrder.customer.phone}</span>
                  {placedOrder.customer.altPhone && (
                    <span className="text-xs text-slate-400">
                      (Alt: {placedOrder.customer.altPhone})
                    </span>
                  )}
                </p>
                {placedOrder.customer.email && (
                  <p className="text-slate-600 flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <span>{placedOrder.customer.email}</span>
                  </p>
                )}
                <div className="pt-2 border-t border-gray-100 mt-2 text-slate-700 leading-relaxed">
                  <p>{placedOrder.customer.address}</p>
                  {placedOrder.customer.address2 && <p>{placedOrder.customer.address2}</p>}
                  <p className="font-medium text-slate-900">
                    {placedOrder.customer.city}, {placedOrder.customer.state}{" "}
                    {placedOrder.customer.postalCode}
                  </p>
                  <p className="text-xs text-slate-500 uppercase">{placedOrder.customer.country}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200/80 p-6 shadow-2xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-[#ff0080]" />
                <span>Payment & Shipping</span>
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-semibold text-slate-900">
                    {placedOrder.paymentMethodTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <span className="text-slate-500">Shipping Method:</span>
                  <span className="font-semibold text-slate-900">
                    {placedOrder.shippingMethodTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <span className="text-slate-500">Shipping Cost:</span>
                  <span className="font-semibold text-slate-900">
                    {placedOrder.shippingCost === 0 ? "FREE" : `Tk ${placedOrder.shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="font-extrabold text-lg text-[#ff0080]">
                    Tk {placedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200/80 p-6 shadow-2xs mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Package size={16} className="text-[#ff0080]" />
              <span>Items in this Order ({placedOrder.items.length})</span>
            </h2>
            <div className="divide-y divide-gray-100">
              {placedOrder.items.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-md bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                      <Image
                        src={item.image || "/woocommerce-placeholder.webp"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized={Boolean(!item.image || item.image.startsWith("/"))}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1e293b] line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Qty: {item.quantity} × Tk {item.price.toFixed(2)}
                        {item.selectedAttributes &&
                          Object.entries(item.selectedAttributes).map(([k, v]) => (
                            <span key={k} className="ml-2 font-medium text-slate-700">
                              {k}: {String(v)}
                            </span>
                          ))}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 shrink-0">
                    Tk {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md bg-[#ff0080] hover:bg-[#d4006a] !text-white text-sm font-bold shadow-xs transition-transform active:scale-[0.98]"
            >
              <ShoppingBag size={16} />
              <span>Continue Shopping</span>
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-gray-300 text-slate-700 hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              <Printer size={16} />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: EMPTY CART GUARD
  // ══════════════════════════════════════════════════════════════
  if (cart.length === 0) {
    return (
      <div className="w-full py-16 md:py-24 bg-white min-h-[70vh] flex items-center justify-center">
        <div className="container max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-[#F1F4F9] flex items-center justify-center mx-auto mb-6 text-[#94A3B8]">
            <Package size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#1e293b] mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            There are no items in your cart to checkout. Please explore our shop to select items.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-md bg-[#ff0080] hover:bg-[#d4006a] !text-white text-sm font-bold shadow-xs transition-all hover:scale-[1.02]"
          >
            <ShoppingBag size={16} />
            <span>Explore Collections</span>
          </Link>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: MAIN CHECKOUT FORM (ALL DATA FROM WOOCOMMERCE)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="w-full py-8 md:py-12 bg-[#FBFBFC] min-h-[85vh]">
      <div className="container max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="pb-6 mb-8 border-b border-gray-200">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href="/cart" className="hover:text-[#ff0080] flex items-center gap-1 transition-colors">
              <ArrowLeft size={13} />
              <span>Return to Cart</span>
            </Link>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="font-semibold text-slate-800">Checkout</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
            Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── LEFT COLUMN: Billing, Shipping & Payment (7 cols) ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Customer Billing & Shipping Address Fields */}
              <div className="bg-white rounded-md border border-gray-200/80 p-5 sm:p-7 shadow-2xs">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-md bg-[#FFF0F5] text-[#ff0080] flex items-center justify-center font-bold text-sm">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#1e293b]">
                      Billing & Delivery Details
                    </h2>
                    <p className="text-xs text-slate-400">
                      Customer information and delivery location
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 1. Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-[#ff0080]">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`w-full pl-10 pr-3.5 h-11 rounded-md border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff0080]/20 transition-all ${errors.fullName ? "border-rose-400 bg-rose-50/20" : "border-gray-200 focus:border-[#ff0080]"
                          }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* 2. Phone & 3. Email (Optional) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Phone Number <span className="text-[#ff0080]">*</span>
                      </label>
                      <div
                        className={`relative flex items-center rounded-md overflow-hidden border transition-all ${
                          errors.phone
                            ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-400"
                            : "border-gray-200 focus-within:border-[#ff0080] focus-within:ring-2 focus-within:ring-[#ff0080]/20"
                        }`}
                      >
                        <span className="inline-flex items-center px-3.5 h-11 bg-gray-50 border-r border-gray-200 text-xs font-bold text-slate-600 select-none shrink-0 tracking-wide">
                          +88
                        </span>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-3.5 h-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-white"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@example.com"
                          className="w-full pl-10 pr-3.5 h-11 rounded-md border border-gray-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff0080] focus:ring-2 focus:ring-[#ff0080]/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. District Searchable Dropdown */}
                  <div ref={districtRef} className="relative">
                    <label htmlFor="district-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      District <span className="text-[#ff0080]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <div
                        id="district-input"
                        onClick={() => {
                          setIsDistrictOpen((prev) => {
                            if (!prev) setDistrictSearch("");
                            return !prev;
                          });
                        }}
                        className={`w-full pl-10 pr-10 h-11 rounded-md border text-sm flex items-center transition-all cursor-pointer select-none bg-white ${
                          errors.district
                            ? "border-rose-400 bg-rose-50/20"
                            : isDistrictOpen
                            ? "border-[#ff0080] ring-2 ring-[#ff0080]/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className={formData.district ? "text-slate-900 font-medium" : "text-slate-400"}>
                          {formData.district || "Select or search district..."}
                        </span>
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {formData.district && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDistrict("");
                              setDistrictSearch("");
                            }}
                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            title="Clear district"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform pointer-events-none ${
                            isDistrictOpen ? "rotate-180 text-[#ff0080]" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Searchable Dropdown Menu */}
                    {isDistrictOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-md border border-gray-200 shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
                        <div className="p-2 border-b border-gray-100 bg-gray-50/80">
                          <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={districtSearch}
                              onChange={(e) => setDistrictSearch(e.target.value)}
                              placeholder="Type to search (e.g. Dhaka, Sylhet)..."
                              className="w-full pl-8 pr-7 py-1.5 bg-white rounded border border-gray-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff0080]"
                              autoFocus
                            />
                            {districtSearch && (
                              <button
                                type="button"
                                onClick={() => setDistrictSearch("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                title="Clear search"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 py-1">
                          {filteredStates.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400">
                              No district matching &quot;{districtSearch}&quot;
                            </div>
                          ) : (
                            filteredStates.map((st) => {
                              const isSelected = formData.district === st.name;
                              return (
                                <button
                                  key={st.code || st.name}
                                  type="button"
                                  onClick={() => handleSelectDistrict(st.name)}
                                  className={`w-full px-3.5 py-2 text-left text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-[#FFF0F5] text-[#ff0080] font-bold"
                                      : "text-slate-700 hover:bg-gray-50"
                                  }`}
                                >
                                  <span>{st.name}</span>
                                  {isSelected && <Check size={14} className="text-[#ff0080]" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {errors.district && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.district}
                      </p>
                    )}
                  </div>

                  {/* 5. Address */}
                  <div>
                    <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Delivery Address <span className="text-[#ff0080]">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={2}
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House no, road no, area, thana, etc."
                      className={`w-full p-3.5 rounded-md border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff0080]/20 transition-all resize-none ${errors.address ? "border-rose-400 bg-rose-50/20" : "border-gray-200 focus:border-[#ff0080]"
                        }`}
                    />
                    {errors.address && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.address}
                      </p>
                    )}
                  </div>

                  {/* 6. Order Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Order Notes <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <FileText size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="notes"
                        name="notes"
                        type="text"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Notes about your order, e.g. special delivery instructions"
                        className="w-full pl-10 pr-3.5 h-11 rounded-md border border-gray-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff0080] focus:ring-2 focus:ring-[#ff0080]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* 7. Shipping Options inside Billing & Delivery */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                      Shipping Options <span className="text-[#ff0080]">*</span>
                    </label>

                    <div className="space-y-2.5">
                      {!selectedDistrict ? (
                        <div className="py-5 px-4 rounded-md border border-dashed border-gray-200 bg-gray-50/60 text-center">
                          <Truck size={20} className="mx-auto text-slate-400 mb-1.5" />
                          <p className="text-xs font-semibold text-slate-600">
                            Please select your district above to view available shipping options.
                          </p>
                        </div>
                      ) : isLoadingShipping ? (
                        <div className="py-5 flex items-center justify-center gap-2.5 text-xs text-slate-500 bg-gray-50/50 rounded-md border border-dashed border-gray-200">
                          <span className="w-4 h-4 border-2 border-[#ff0080]/30 border-t-[#ff0080] rounded-full animate-spin" />
                          <span>Loading shipping options from WooCommerce...</span>
                        </div>
                      ) : shippingMethods.length === 0 ? (
                        <div className="p-3.5 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                          No shipping zone available for {selectedDistrict}. Please select another district.
                        </div>
                      ) : (
                        shippingMethods.map((method) => {
                          const isSelected = selectedShippingId === method.id;
                          return (
                            <label
                              key={method.id}
                              className={`block p-3.5 rounded-md border transition-all cursor-pointer ${isSelected
                                ? "border-[#ff0080] bg-[#FFF5F8] ring-1 ring-[#ff0080]"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="shippingMethod"
                                  value={method.id}
                                  checked={isSelected}
                                  onChange={() => setSelectedShippingId(method.id)}
                                  className="mt-0.5 accent-[#ff0080] cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-bold text-slate-900">
                                      {method.title}
                                    </span>
                                    <span className="text-xs font-extrabold text-[#ff0080] shrink-0">
                                      {method.cost === 0 ? "FREE" : `Tk ${method.cost.toFixed(2)}`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </label>
                          );
                        })
                      )}
                      {errors.shipping && (
                        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.shipping}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Order Summary Sticky Card (5 cols) ── */}
            <div className="lg:col-span-5 lg:sticky lg:top-[150px] space-y-4">
              <div className="bg-white rounded-md border border-gray-200/80 p-5 sm:p-6 shadow-2xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-[#1e293b] flex items-center gap-2">
                    <Package size={18} className="text-slate-600" />
                    <span>Order Summary</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items Preview */}
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 pr-1 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="py-3 flex items-start gap-3">
                      <div className="relative w-14 h-14 rounded-md bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                        <Image
                          src={item.image || "/woocommerce-placeholder.webp"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized={Boolean(!item.image || item.image.startsWith("/"))}
                        />
                        <span className="absolute bottom-0 right-0 bg-[#ff0080] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-md">
                          ×{item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {item.name}
                        </p>
                        {item.selectedAttributes &&
                          Object.entries(item.selectedAttributes).map(([k, v]) => (
                            <span key={k} className="text-[10px] text-slate-500 block">
                              {k}: <strong className="text-slate-700">{String(v)}</strong>
                            </span>
                          ))}
                        <span className="text-xs font-bold text-[#ff0080] mt-1 block">
                          Tk {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Box */}
                <div className="pt-2 pb-4 border-t border-gray-100">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-xs">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Tag size={14} className="text-emerald-600" />
                        <span>
                          Code <strong>{appliedCoupon.code}</strong> applied (-Tk {discount.toFixed(2)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-2 cursor-pointer"
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
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Coupon code"
                          className="flex-1 h-10 px-3.5 rounded-md border border-gray-200 text-xs text-slate-900 placeholder:text-slate-400 uppercase tracking-wider focus:outline-none focus:border-[#ff0080] disabled:bg-gray-50"
                        />
                        <button
                          type="button"
                          disabled={isApplyingCoupon}
                          onClick={() => handleApplyCoupon()}
                          className="h-10 px-5 rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        >
                          {isApplyingCoupon ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Calculation breakdown */}
                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      Tk {subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Shipping</span>
                      {activeShippingMethod?.title && (
                        <span className="text-[11px] text-slate-400">
                          ({activeShippingMethod.title})
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {shippingMethods.length === 0 ? (
                        <span className="text-amber-600 font-medium text-xs">Not available</span>
                      ) : shippingCost === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `Tk ${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span className="font-bold">-Tk {discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-base font-extrabold text-slate-900">
                    <span>Total</span>
                    <span className="text-lg text-[#ff0080]">
                      Tk {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Options inside Order Summary */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard size={14} className="text-[#ff0080]" />
                      <span>Payment Method</span>
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {isLoadingGateways ? (
                      <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-500 bg-gray-50/50 rounded-md border border-dashed border-gray-200">
                        <span className="w-4 h-4 border-2 border-[#ff0080]/30 border-t-[#ff0080] rounded-full animate-spin" />
                        <span>Loading payment options...</span>
                      </div>
                    ) : gateways.length === 0 ? (
                      <div className="p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                        No active payment gateways found in WooCommerce.
                      </div>
                    ) : (
                      gateways.map((gateway) => {
                        const isSelected = selectedPaymentId === gateway.id;
                        return (
                          <label
                            key={gateway.id}
                            className={`block p-3 rounded-md border transition-all cursor-pointer ${isSelected
                              ? "border-[#ff0080] bg-[#FFF5F8] ring-1 ring-[#ff0080]"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <input
                                type="radio"
                                name="paymentGateway"
                                value={gateway.id}
                                checked={isSelected}
                                onChange={() => setSelectedPaymentId(gateway.id)}
                                className="mt-0.5 accent-[#ff0080] cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold text-slate-900 block">
                                  {gateway.title}
                                </span>
                                {gateway.description && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                    {gateway.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })
                    )}
                    {errors.payment && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.payment}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Order Button */}
                <div className="mt-5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-md bg-[#ff0080] hover:bg-[#d4006a] disabled:bg-slate-300 !text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Placing Order...
                      </span>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>Place Order • Tk {grandTotal.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    Your personal data will be used to process your order and support your experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
