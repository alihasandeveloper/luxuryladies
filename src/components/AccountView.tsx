"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CustomerOrder, UserAddress } from "@/types/auth";
import {
  LayoutDashboard,
  Package,
  MapPin,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Building,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Format order prices cleanly without leaking raw WooCommerce HTML tags
 */
function formatOrderPrice(
  rawFormatted?: string,
  total?: string | number,
  currency: string = "BDT"
): string {
  // 1. If clean numeric total is available, format with currency symbol
  if (total !== undefined && total !== null && total !== "") {
    const num = typeof total === "number" ? total : parseFloat(String(total));
    if (!isNaN(num)) {
      const sym = currency === "BDT" ? "৳" : currency ? `${currency} ` : "৳";
      return `${sym}${num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  }

  // 2. Fallback: strip raw WooCommerce HTML tags and decode entities
  if (rawFormatted) {
    return rawFormatted
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&#2547;/g, "৳")
      .replace(/&amp;/g, "&")
      .trim();
  }

  return "৳0.00";
}

function OrderItemThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  const [imgSrc, setImgSrc] = useState(
    src && typeof src === "string" && src.trim().length > 0
      ? src.trim()
      : "/woocommerce-placeholder.webp"
  );

  return (
    <Image
      src={imgSrc}
      alt={alt || "Product"}
      fill
      sizes="48px"
      unoptimized={Boolean(typeof imgSrc === "string" && (imgSrc.startsWith("/") || imgSrc.includes("localhost") || imgSrc.includes("headless.local")))}
      className="object-cover"
      onError={() => {
        if (imgSrc !== "/woocommerce-placeholder.webp") {
          setImgSrc("/woocommerce-placeholder.webp");
        }
      }}
    />
  );
}

function normalizeAccountTab(tab?: string | null): string {
  if (!tab) return "dashboard";
  const lower = tab.toLowerCase().trim();
  if (lower === "orders" || lower === "order") return "orders";
  if (lower === "addresses" || lower === "address") return "addresses";
  if (lower === "profile" || lower === "account" || lower === "details") return "account";
  return "dashboard";
}

export default function AccountView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");

  const { user, isAuthenticated, isLoading, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => normalizeAccountTab(urlTab));

  // Sync state whenever the URL search parameter changes (e.g. from header link or direct URL)
  useEffect(() => {
    setActiveTab(normalizeAccountTab(urlTab));
  }, [urlTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/account?${params.toString()}`, { scroll: false });
  };

  // Orders state
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);

  // Profile Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Billing address state
  const [billing, setBilling] = useState<UserAddress>({});
  const [billingSaving, setBillingSaving] = useState(false);

  // Shipping address state
  const [shipping, setShipping] = useState<UserAddress>({});
  const [shippingSaving, setShippingSaving] = useState(false);

  // Sync state with user profile
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setDisplayName(user.display_name || user.username || "");
      setBilling(user.billing || {});
      setShipping(user.shipping || {});
    }
  }, [user]);

  // Fetch orders
  useEffect(() => {
    if (user?.id) {
      setOrdersLoading(true);
      fetch(`/api/auth/orders?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        })
        .catch((err) => console.error("Error fetching orders:", err))
        .finally(() => setOrdersLoading(false));
    }
  }, [user?.id]);

  // If user is not authenticated, redirect to /login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/account");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center">
        <div className="w-9 h-9 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-description">Loading your account...</p>
      </div>
    );
  }

  // Handle Account Details Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setProfileSaving(true);
    const payload: any = {
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
    };
    if (newPassword) {
      payload.new_password = newPassword;
    }

    const res = await updateProfile(payload);
    setProfileSaving(false);
    if (res.success && newPassword) {
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // Handle Billing Address Submit
  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBillingSaving(true);

    const payload: any = {};
    Object.keys(billing).forEach((key) => {
      payload[`billing_${key}`] = (billing as any)[key];
    });

    await updateProfile(payload);
    setBillingSaving(false);
  };

  // Handle Shipping Address Submit
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShippingSaving(true);

    const payload: any = {};
    Object.keys(shipping).forEach((key) => {
      payload[`shipping_${key}`] = (shipping as any)[key];
    });

    await updateProfile(payload);
    setShippingSaving(false);
  };

  // Status badge styling
  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    let badgeClass = "bg-slate-100 text-slate-700";
    if (s === "completed") badgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
    else if (s === "processing") badgeClass = "bg-blue-50 text-blue-700 border border-blue-200";
    else if (s === "pending" || s === "on-hold") badgeClass = "bg-amber-50 text-amber-700 border border-amber-200";
    else if (s === "cancelled" || s === "failed") badgeClass = "bg-rose-50 text-rose-700 border border-rose-200";

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${badgeClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="w-full py-10 md:py-14 bg-bg/30">
      <div className="container">
        {/* ── Customer Header Banner ── */}
        <div className="bg-white border border-border p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.display_name || "User Avatar"}
                  width={64}
                  height={64}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(user.first_name || user.username || "U")[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl md:text-2xl font-medium text-dark">
                  {user.first_name ? `${user.first_name} ${user.last_name}` : user.display_name}
                </h1>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary uppercase rounded-full">
                  Customer
                </span>
              </div>
              <p className="text-xs md:text-sm text-description mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover !text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <ShoppingBag size={14} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* ── Main Layout: Sidebar + Tab Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <aside className="lg:col-span-1">
            <nav className="bg-white border border-border divide-y divide-border">
              <button
                type="button"
                onClick={() => handleTabChange("dashboard")}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-primary text-white"
                    : "text-dark hover:bg-bg hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </div>
                <ChevronRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("orders")}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-primary text-white"
                    : "text-dark hover:bg-bg hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package size={16} />
                  <span>Orders</span>
                </div>
                {orders.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === "orders" ? "bg-white text-primary" : "bg-primary/10 text-primary"
                  }`}>
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("addresses")}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === "addresses"
                    ? "bg-primary text-white"
                    : "text-dark hover:bg-bg hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin size={16} />
                  <span>Addresses</span>
                </div>
                <ChevronRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("account")}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === "account"
                    ? "bg-primary text-white"
                    : "text-dark hover:bg-bg hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon size={16} />
                  <span>Account Details</span>
                </div>
                <ChevronRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </div>
              </button>
            </nav>
          </aside>

          {/* Tab Content */}
          <main className="lg:col-span-3">
            {/* 1. Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="bg-white border border-border p-6 md:p-8">
                  <h2 className="text-lg md:text-xl font-medium text-dark mb-2">
                    Hello, {user.first_name || user.display_name}!
                  </h2>
                  <p className="text-xs md:text-sm text-description leading-relaxed">
                    From your account dashboard, you can effortlessly view your{" "}
                    <button onClick={() => handleTabChange("orders")} className="text-primary font-semibold hover:underline">
                      recent orders
                    </button>, manage your{" "}
                    <button onClick={() => handleTabChange("addresses")} className="text-primary font-semibold hover:underline">
                      shipping and billing addresses
                    </button>, and edit your{" "}
                    <button onClick={() => handleTabChange("account")} className="text-primary font-semibold hover:underline">
                      password and account details
                    </button>.
                  </p>
                </div>

                {/* Quick stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => handleTabChange("orders")}
                    className="bg-white border border-border p-5 hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-description">
                        Total Orders
                      </span>
                      <Package size={20} className="text-primary" />
                    </div>
                    <p className="text-3xl font-light text-dark">{orders.length}</p>
                    <span className="text-[11px] text-primary group-hover:underline inline-block mt-2">
                      View all orders &rarr;
                    </span>
                  </div>

                  <div
                    onClick={() => handleTabChange("addresses")}
                    className="bg-white border border-border p-5 hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-description">
                        Billing Address
                      </span>
                      <MapPin size={20} className="text-primary" />
                    </div>
                    <p className="text-xs text-dark line-clamp-2 leading-relaxed">
                      {user.billing?.address_1
                        ? `${user.billing.address_1}, ${user.billing.city || ""}`
                        : "No address set yet"}
                    </p>
                    <span className="text-[11px] text-primary group-hover:underline inline-block mt-2">
                      Manage address &rarr;
                    </span>
                  </div>

                  <div
                    onClick={() => handleTabChange("account")}
                    className="bg-white border border-border p-5 hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-description">
                        Security
                      </span>
                      <UserIcon size={20} className="text-primary" />
                    </div>
                    <p className="text-xs text-dark">Password & Profile Details</p>
                    <span className="text-[11px] text-primary group-hover:underline inline-block mt-2">
                      Edit details &rarr;
                    </span>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                {orders.length > 0 && (
                  <div className="bg-white border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-dark">
                        Recent Orders
                      </h3>
                      <button
                        onClick={() => handleTabChange("orders")}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="divide-y divide-border">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-dark">#{order.order_number}</p>
                            <p className="text-xs text-description">{order.date_created}</p>
                          </div>
                          <div>{renderStatusBadge(order.status)}</div>
                          <p className="text-sm font-semibold text-primary">
                            {formatOrderPrice(order.formatted_total, order.total, order.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white border border-border p-6 md:p-8">
                <h2 className="text-lg font-medium text-dark mb-6 pb-3 border-b border-border">
                  Your Order History
                </h2>

                {ordersLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-description">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-description">
                      <Package size={26} />
                    </div>
                    <h3 className="text-base font-semibold text-dark mb-1">No orders yet</h3>
                    <p className="text-xs text-description mb-5">
                      You haven&apos;t placed any orders with us yet.
                    </p>
                    <Link
                      href="/shop"
                      className="px-6 py-2.5 bg-primary hover:bg-primary-hover !text-white text-xs font-bold uppercase tracking-wider transition-colors inline-block"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-border p-5 hover:border-primary/50 transition-colors"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-border">
                          <div>
                            <span className="text-xs font-semibold text-description uppercase tracking-wider block">
                              Order Number
                            </span>
                            <span className="text-base font-bold text-dark">
                              #{order.order_number}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-description uppercase tracking-wider block">
                              Date Placed
                            </span>
                            <span className="text-xs text-dark">{order.date_created}</span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-description uppercase tracking-wider block">
                              Total
                            </span>
                            <span className="text-sm font-bold text-primary">
                              {formatOrderPrice(order.formatted_total, order.total, order.currency)}
                            </span>
                          </div>
                          <div>{renderStatusBadge(order.status)}</div>
                        </div>

                        {/* Order Line Items */}
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3.5">
                              <div className="w-12 h-14 bg-slate-100 relative shrink-0 overflow-hidden border border-border">
                                <OrderItemThumbnail src={item.image} alt={item.name} />
                              </div>
                              <div className="grow min-w-0">
                                <p className="text-xs font-medium text-dark truncate">{item.name}</p>
                                <p className="text-[11px] text-description">
                                  Qty: {item.quantity} &times;{" "}
                                  {formatOrderPrice(
                                    item.subtotal,
                                    item.total
                                      ? (parseFloat(item.total) / (item.quantity || 1)).toFixed(2)
                                      : undefined,
                                    order.currency
                                  )}
                                </p>
                              </div>
                              <div className="text-xs font-semibold text-dark text-right">
                                {formatOrderPrice(undefined, item.total, order.currency)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-8">
                {/* Billing Address Form */}
                <div className="bg-white border border-border p-6 md:p-8">
                  <h2 className="text-lg font-medium text-dark mb-2">Billing Address</h2>
                  <p className="text-xs text-description mb-6">
                    The following address will be used on the checkout page by default.
                  </p>

                  <form onSubmit={handleBillingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={billing.first_name || ""}
                          onChange={(e) => setBilling({ ...billing, first_name: e.target.value })}
                          className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={billing.last_name || ""}
                          onChange={(e) => setBilling({ ...billing, last_name: e.target.value })}
                          className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="House number and street name"
                        value={billing.address_1 || ""}
                        onChange={(e) => setBilling({ ...billing, address_1: e.target.value })}
                        className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                          City / District
                        </label>
                        <input
                          type="text"
                          value={billing.city || ""}
                          onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                          className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                          Postcode / ZIP
                        </label>
                        <input
                          type="text"
                          value={billing.postcode || ""}
                          onChange={(e) => setBilling({ ...billing, postcode: e.target.value })}
                          className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={billing.phone || ""}
                          onChange={(e) => setBilling({ ...billing, phone: e.target.value })}
                          className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={billingSaving}
                        className="px-6 py-2.5 bg-primary hover:bg-primary-hover !text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {billingSaving ? "Saving..." : "Save Billing Address"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Shipping Address Form */}
                <div className="bg-white border border-border p-6 md:p-8">
                  <h2 className="text-lg font-medium text-dark mb-2">Shipping Address</h2>
                  <p className="text-xs text-description mb-6">
                    Where your parcels and orders will be delivered.
                  </p>

                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={shipping.first_name || ""}
                          onChange={(e) => setShipping({ ...shipping, first_name: e.target.value })}
                          className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={shipping.last_name || ""}
                          onChange={(e) => setShipping({ ...shipping, last_name: e.target.value })}
                          className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        placeholder="Apartment, suite, unit, etc."
                        value={shipping.address_1 || ""}
                        onChange={(e) => setShipping({ ...shipping, address_1: e.target.value })}
                        className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={shipping.city || ""}
                          onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                          className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                          Postcode
                        </label>
                        <input
                          type="text"
                          value={shipping.postcode || ""}
                          onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
                          className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={shippingSaving}
                        className="px-6 py-2.5 bg-primary hover:bg-primary-hover !text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {shippingSaving ? "Saving..." : "Save Shipping Address"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 4. Account Details Tab */}
            {activeTab === "account" && (
              <div className="bg-white border border-border p-6 md:p-8">
                <h2 className="text-lg font-medium text-dark mb-2">Account Details</h2>
                <p className="text-xs text-description mb-6">
                  Manage your personal name, display name, and password.
                </p>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                    />
                    <p className="text-[11px] text-description mt-1">
                      This will be how your name will be displayed in the account section and in reviews.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full h-10 px-3 text-xs bg-slate-100 border border-border text-slate-500 rounded-none cursor-not-allowed"
                    />
                  </div>

                  {/* Password Change Box */}
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-dark mb-3">
                      Password Change
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                          New Password (leave blank to leave unchanged)
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-10 px-3 pr-10 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-dark cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {newPassword && (
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-10 px-3 text-xs bg-white border border-border focus:border-primary focus:outline-hidden rounded-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-hover !text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {profileSaving ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
