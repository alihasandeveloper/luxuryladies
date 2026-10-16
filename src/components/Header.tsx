"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Heart, Truck, ShoppingBag, User, X, LogIn, LogOut, Package, MapPin, ChevronRight, Menu, Sparkles } from "lucide-react";
import { WooCommerceProduct } from "@/types/woocommerce";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about" },
];

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

interface HeaderCategory {
  label: string;
  slug: string;
}

function SearchQuerySync({ onQueryChange }: { onQueryChange: (q: string) => void }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  useEffect(() => {
    onQueryChange(q || "");
  }, [q, onQueryChange]);

  return null;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Close drawer and mobile search on route navigation, ensuring clean scroll state
  useEffect(() => {
    document.body.classList.remove("scroll-locked");
    document.body.style.top = "";
    setDrawerOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer or mobile search is open (iOS-safe)
  useEffect(() => {
    const shouldLock = drawerOpen || mobileSearchOpen;
    if (shouldLock) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add("scroll-locked");
    } else {
      // Restore scroll position only if body was locked
      const scrollY = document.body.style.top;
      document.body.classList.remove("scroll-locked");
      document.body.style.top = "";
      if (scrollY) {
        window.scrollTo({ top: parseInt(scrollY || "0") * -1, behavior: "instant" });
      }
    }
  }, [drawerOpen, mobileSearchOpen]);

  // Focus input when mobile search opens
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [mobileSearchOpen]);

  const [liveProducts, setLiveProducts] = useState<WooCommerceProduct[]>([]);
  const [liveCategories, setLiveCategories] = useState<HeaderCategory[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLiveProducts(data);
        }
      })
      .catch(() => { });

    const cleanName = (str: string) =>
      (str || "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, " ");

    fetch("/api/general-settings")
      .then((res) => res.json())
      .then((json) => {
        const headerCats = json?.data?.header_categories;
        if (Array.isArray(headerCats) && headerCats.length > 0) {
          setLiveCategories(
            headerCats.map((c: any) => ({
              label: cleanName(c.name),
              slug: c.slug,
            }))
          );
        } else {
          // Fallback
          fetch("/api/products?type=categories")
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data)) {
                setLiveCategories(
                  data
                    .filter((c: any) => c.slug !== "uncategorized")
                    .map((c: any) => ({
                      label: cleanName(c.name),
                      slug: c.slug,
                    }))
                );
              }
            })
            .catch(() => { });
        }
      })
      .catch(() => {
        fetch("/api/products?type=categories")
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setLiveCategories(
                data
                  .filter((c: any) => c.slug !== "uncategorized")
                  .map((c: any) => ({
                    label: cleanName(c.name),
                    slug: c.slug,
                  }))
              );
            }
          })
          .catch(() => { });
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      if (pathname === "/shop") {
        router.push("/shop");
      }
      return;
    }
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileSearchOpen(false);
  };

  const handleSelectSuggestion = (productSlug: string) => {
    router.push(`/product/${productSlug}`);
    setMobileSearchOpen(false);
  };

  const matchingSuggestions = searchQuery.trim()
    ? liveProducts
      .filter((p) =>
        p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        p.categories?.some((c: any) => c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
      )
      .slice(0, 5)
    : [];

  return (
    <>
      <Suspense fallback={null}>
        <SearchQuerySync onQueryChange={setSearchQuery} />
      </Suspense>
      <header className="site-header">
        {/* ── Top Bar ─────────────────────────────────── */}
        <div className="header-top">
          <div className="container header-top-inner">

            {/* Left section on mobile: Hamburger Menu + Mobile Search Icon (hidden on desktop) */}
            <div className="flex items-center gap-1 md:hidden">
              {/* Hamburger / Menu (mobile only) */}
              <button
                className="hamburger-btn flex md:hidden items-center justify-center"
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu size={22} strokeWidth={1.85} className="text-slate-600 hover:text-primary transition-colors" />
              </button>

              {/* Search icon (mobile only - placed beside menu) */}
              <button
                className="action-btn mobile-search-btn md:hidden"
                aria-label="Toggle search"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
              >
                <Search size={19} strokeWidth={1.75} />
              </button>
            </div>

            {/* Logo (Centered on mobile, normal position on desktop) */}
            <div className="flex-1 flex justify-center md:flex-initial md:justify-start">
              <Link href="/" className="header-logo inline-flex items-center justify-center" aria-label="luxuryladies Home">
                <Image
                  src="/luxuryladies-logo.png"
                  alt="luxuryladies"
                  width={200}
                  height={60}
                  priority
                  className="w-auto h-[36px] xs:h-[40px] md:h-[54px] max-w-[140px] sm:max-w-[170px] md:max-w-[200px] object-contain"
                />
              </Link>
            </div>

            {/* Main Nav (desktop only) */}
            <nav className="header-nav desktop-only" aria-label="Main navigation">
              <ul>
                {navLinks.map((link) => {
                  const isActive = isLinkActive(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={isActive ? "active" : ""}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Search Bar (desktop only) */}
            <form onSubmit={handleSearchSubmit} className="header-search desktop-only">
              <Search className="search-icon" size={17} strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Icon Actions (Right side: Cart, User on mobile; Wishlist, Compare, Cart, User on desktop) */}
            <div className="header-actions">
              {/* Wishlist (desktop only) */}
              <Link
                href="/wishlist"
                className="action-btn desktop-only relative"
                aria-label={`Wishlist (${wishlistCount} items)`}
                title="Wishlist"
              >
                <Heart
                  size={19}
                  strokeWidth={1.75}
                />
                {wishlistCount > 0 && (
                  <span className="cart-badge" aria-hidden="true">{wishlistCount}</span>
                )}
              </Link>

              {/* Track Order (desktop only) */}
              <Link
                href="/track-order"
                className="action-btn desktop-only"
                aria-label="Track Order"
                title="Track Order"
              >
                <Truck size={19} strokeWidth={1.75} />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="action-btn cart-btn"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingBag size={19} strokeWidth={1.75} />
                {cartCount > 0 && (
                  <span className="cart-badge" aria-hidden="true">{cartCount}</span>
                )}
              </Link>

              {/* Account Dropdown */}
              <div className="relative group">
                <Link
                  href={isAuthenticated ? "/account" : "/login"}
                  className="action-btn"
                  aria-label={isAuthenticated ? "My Account" : "Sign In"}
                >
                  <User size={19} strokeWidth={1.75} />
                </Link>

                {/* Submenu Dropdown on Hover */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="w-64 bg-white border border-border shadow-xl rounded-none overflow-hidden text-left">
                    {isAuthenticated && user ? (
                      <div>
                        {/* User Header */}
                        <div className="p-3.5 border-b border-border bg-slate-50/70">
                          <p className="text-xs font-bold text-dark truncate">
                            {user.first_name
                              ? `${user.first_name} ${user.last_name || ""}`.trim()
                              : user.display_name || user.username}
                          </p>
                          <p className="text-[11px] text-description truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        {/* Navigation Links */}
                        <div className="py-1">
                          <Link
                            href="/account?tab=dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark hover:text-primary hover:bg-bg/40 transition-colors"
                          >
                            <User size={14} className="text-slate-400" />
                            <span>My Account</span>
                          </Link>
                          <Link
                            href="/account?tab=orders"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark hover:text-primary hover:bg-bg/40 transition-colors"
                          >
                            <Package size={14} className="text-slate-400" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            href="/account?tab=addresses"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark hover:text-primary hover:bg-bg/40 transition-colors"
                          >
                            <MapPin size={14} className="text-slate-400" />
                            <span>Saved Addresses</span>
                          </Link>
                          <Link
                            href="/track-order"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark hover:text-primary hover:bg-bg/40 transition-colors"
                          >
                            <Truck size={14} className="text-slate-400" />
                            <span>Track Order</span>
                          </Link>
                        </div>

                        {/* Sign Out */}
                        <div className="p-2 border-t border-border bg-slate-50/40">
                          <button
                            type="button"
                            onClick={() => logout()}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left rounded-none"
                          >
                            <LogOut size={13} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Guest Welcome */}
                        <div className="p-3.5 border-b border-border bg-slate-50/70 text-center">
                          <p className="text-xs font-bold text-dark uppercase tracking-wider">
                            Welcome
                          </p>
                          <p className="text-[11px] text-description mt-0.5">
                            Manage your orders and profile
                          </p>
                        </div>

                        {/* Auth Buttons */}
                        <div className="p-3 flex flex-col gap-2">
                          <Link
                            href="/login"
                            className="w-full py-2 px-3 bg-primary hover:bg-primary-hover !text-white text-xs font-bold uppercase tracking-wider text-center transition-colors rounded-none"
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/register"
                            className="w-full py-2 px-3 bg-white hover:bg-bg text-dark border border-border hover:border-primary text-xs font-bold uppercase tracking-wider text-center transition-colors rounded-none"
                          >
                            Create Account
                          </Link>
                        </div>

                        {/* Quick Links */}
                        <div className="border-t border-border py-1">
                          <Link
                            href="/track-order"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark hover:text-primary hover:bg-bg/40 transition-colors"
                          >
                            <Truck size={14} className="text-slate-400" />
                            <span>Track Order</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inline dropdown replaced by top sliding drawer below */}
        </div>

        {/* ── Category Bar (desktop only) ──────────────── */}
        <nav className="header-categories desktop-only" aria-label="Category navigation">
          <div className="container">
            <ul>
              {liveCategories.map((cat) => {
                const catHref = `/category/${cat.slug}`;
                const isActive = pathname === catHref;
                return (
                  <li key={cat.slug}>
                    <Link
                      href={catHref}
                      className={isActive ? "active" : ""}
                    >
                      {cat.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {/* ── Top Slide-down Mobile Search Wrapper ── */}
      {/* Search Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-[120] transition-opacity duration-300 md:hidden ${mobileSearchOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMobileSearchOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-Down Search Panel from Top */}
      <div
        className={`fixed top-0 left-0 right-0 bg-white z-[130] shadow-xl border-b border-border transition-transform duration-300 ease-out md:hidden ${mobileSearchOpen ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="px-5 pt-3.5 pb-5 flex flex-col gap-2.5">
          {/* Top row with subtle close button on right */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="text-description hover:text-dark transition-colors cursor-pointer p-1"
              aria-label="Close search"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          {/* Subtitle / Question */}
          <p className="text-xs font-medium text-description tracking-wide -mt-1">
            What are you looking for?
          </p>

          {/* Search Input Form (Pink bordered rounded-full pill) */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="w-full flex items-center border-2 border-primary rounded-full px-3.5 py-2.5 bg-white transition-all shadow-xs">
              <Search size={18} className="text-primary shrink-0 mr-2.5" strokeWidth={2} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-dark placeholder:text-description outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer shrink-0"
                  aria-label="Clear text"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Live Matching Product Suggestions */}
        {matchingSuggestions.length > 0 && (
          <div className="px-4 pb-4 pt-1 border-t border-border flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
            <span className="text-[11px] font-semibold text-description uppercase tracking-wider">
              Matching Products ({matchingSuggestions.length})
            </span>
            <div className="divide-y divide-border">
              {matchingSuggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item.slug)}
                  className="flex items-center gap-3 py-2 cursor-pointer hover:bg-bg -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="relative w-11 h-11 rounded-md overflow-hidden bg-bg shrink-0 border border-border">
                    <Image
                      src={item.images?.[0]?.src || "/woocommerce-placeholder.webp"}
                      alt={item.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                      unoptimized={Boolean(!item.images?.[0]?.src || item.images[0].src.startsWith("/"))}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-dark truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] font-semibold text-primary">
                      Tk {parseFloat(item.price).toLocaleString()}
                      {item.sku && (
                        <span className="ml-1.5 text-[10px] text-description font-normal">
                          SKU: {item.sku}
                        </span>
                      )}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-description/60 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile Drawer ────────────────────────────── */}
      {/* Overlay */}
      <div
        className={`drawer-overlay${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside className={`drawer${drawerOpen ? " open" : ""}`} aria-label="Mobile menu">
        {/* Clean Minimal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-white">
          <Link href="/" onClick={() => setDrawerOpen(false)} className="inline-flex items-center">
            <Image
              src="/luxuryladies-logo.png"
              alt="luxuryladies"
              width={140}
              height={42}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-description hover:text-primary hover:bg-bg transition-colors"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 bg-white">
          {/* Main Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${active
                      ? "text-primary bg-bg"
                      : "text-slate-600 hover:text-primary hover:bg-bg"
                    }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight size={15} className={active ? "text-primary" : "text-slate-600"} />
                </Link>
              );
            })}
          </nav>

          {/* Clean Divider */}
          <div className="h-[1px] bg-border" />

          {/* Shop Categories Section */}
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-description px-3 mb-2">
              Categories
            </p>
            <nav className="flex flex-col space-y-0.5">
              {liveCategories.map((cat) => {
                const catHref = `/category/${cat.slug}`;
                const active = pathname === catHref;
                return (
                  <Link
                    key={cat.slug}
                    href={catHref}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-[13px] transition-colors ${active
                        ? "text-primary bg-bg"
                        : "text-slate-600 hover:text-primary hover:bg-bg"
                      }`}
                  >
                    <span className="font-normal">{cat.label}</span>
                    <ChevronRight size={13} className={active ? "text-primary" : "text-slate-600"} />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Clean Divider */}
          <div className="h-[1px] bg-border" />

          {/* Quick Access Icons */}
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-description px-3 mb-2">
              Account & Saved
            </p>
            <div className="grid grid-cols-3 gap-2 px-1">
              <Link
                href="/wishlist"
                onClick={() => setDrawerOpen(false)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-md border text-xs font-medium gap-1.5 transition-colors relative ${pathname === "/wishlist"
                    ? "border-primary text-primary bg-bg"
                    : "border-border hover:border-primary hover:text-primary text-slate-600"
                  }`}
              >
                <div className="relative">
                  <Heart
                    size={16}
                    strokeWidth={1.75}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span>Wishlist</span>
              </Link>
              <Link
                href="/track-order"
                onClick={() => setDrawerOpen(false)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-md border text-xs font-medium gap-1.5 transition-colors ${
                  pathname === "/track-order"
                    ? "border-primary text-primary bg-bg"
                    : "border-border hover:border-primary hover:text-primary text-slate-600"
                }`}
              >
                <Truck size={16} strokeWidth={1.75} />
                <span>Track Order</span>
              </Link>
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                onClick={() => setDrawerOpen(false)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-md border text-xs font-medium gap-1.5 transition-colors ${
                  pathname === "/account" || pathname === "/login"
                    ? "border-primary text-primary bg-bg"
                    : "border-border hover:border-primary hover:text-primary text-slate-600"
                }`}
              >
                <User size={16} strokeWidth={1.75} />
                <span>{isAuthenticated ? "Account" : "Sign In"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Clean Drawer Footer */}
        <div className="p-4 border-t border-border bg-white flex flex-col gap-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                onClick={() => setDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 !bg-primary hover:!bg-primary-hover !text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                <User size={15} className="!text-white shrink-0" />
                <span className="!text-white text-inherit">My Account ({user?.first_name || user?.username})</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                className="w-full py-2 text-center text-xs font-medium text-rose-600 hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 !bg-primary hover:!bg-primary-hover !text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                <LogIn size={15} className="!text-white shrink-0" />
                <span className="!text-white text-inherit">Sign In</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setDrawerOpen(false)}
                className="w-full py-2 text-center text-xs font-medium text-description hover:text-primary transition-colors"
              >
                Create an Account
              </Link>
            </>
          )}
        </div>
      </aside>

    </>
  );
}
