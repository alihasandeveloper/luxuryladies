"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Heart, ArrowLeftRight, ShoppingBag, User, X, LogIn, ChevronRight, Menu, Sparkles } from "lucide-react";
import { allProducts } from "@/data/products";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about" },
];

const categories = [
  { label: "Golden Picks", emoji: "✨" },
  { label: "Luxury Edit Heels", emoji: "👠" },
  { label: "Luxury Bags", emoji: "👜" },
  { label: "Party Clutch", emoji: "🎀" },
  { label: "Z-Style Heels", emoji: "💎" },
  { label: "2 Pcs PJ Sets", emoji: "🌙" },
  { label: "Flats & Sandals", emoji: "🩴" },
  { label: "3 Pcs PJ Sets", emoji: "☁️" },
  { label: "Clearance Sale!!!", emoji: "🔥" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount] = useState(3);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileSearchOpen(false);
  };

  const handleSelectSuggestion = (productSlug: string) => {
    router.push(`/product/${productSlug}`);
    setMobileSearchOpen(false);
  };

  const matchingSuggestions = searchQuery.trim()
    ? allProducts
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          p.sku?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          p.categories?.some((c) => c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
        )
        .slice(0, 5)
    : [];

  return (
    <>
      <header className="site-header">
        {/* ── Top Bar ─────────────────────────────────── */}
        <div className="header-top">
          <div className="container header-top-inner">

            {/* Left section on mobile: Hamburger Menu + Mobile Search Icon */}
            <div className="flex items-center gap-1 md:contents">
              {/* Hamburger / Menu (mobile only) */}
              <button
                className="hamburger-btn"
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu size={22} strokeWidth={1.85} className="text-slate-600 hover:text-[#ff0080] transition-colors" />
              </button>

              {/* Search icon (mobile only - placed beside menu) */}
              <button
                className="action-btn mobile-search-btn mobile-only"
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
              <button className="action-btn desktop-only" aria-label="Wishlist">
                <Heart size={19} strokeWidth={1.75} />
              </button>

              {/* Compare (desktop only) */}
              <button className="action-btn desktop-only" aria-label="Compare">
                <ArrowLeftRight size={19} strokeWidth={1.75} />
              </button>

              {/* Cart */}
              <button className="action-btn cart-btn" aria-label={`Cart (${cartCount} items)`}>
                <ShoppingBag size={19} strokeWidth={1.75} />
                {cartCount > 0 && (
                  <span className="cart-badge" aria-hidden="true">{cartCount}</span>
                )}
              </button>

              {/* Account */}
              <button className="action-btn" aria-label="Account">
                <User size={19} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Inline dropdown replaced by top sliding drawer below */}
        </div>

        {/* ── Category Bar (desktop only) ──────────────── */}
        <nav className="header-categories desktop-only" aria-label="Category navigation">
          <div className="container">
            <ul>
              {categories.map((cat) => {
                const catHref = `/category/${cat.label.toLowerCase().replace(/\s+/g, "-")}`;
                const isActive = pathname === catHref;
                return (
                  <li key={cat.label}>
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
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-[120] transition-opacity duration-300 md:hidden ${
          mobileSearchOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileSearchOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-Down Search Panel from Top */}
      <div
        className={`fixed top-0 left-0 right-0 bg-white z-[130] shadow-xl border-b border-[#F2E6EC] transition-transform duration-300 ease-out md:hidden ${
          mobileSearchOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="px-5 pt-3.5 pb-5 flex flex-col gap-2.5">
          {/* Top row with subtle close button on right */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="text-[#666] hover:text-[#111] transition-colors cursor-pointer p-1"
              aria-label="Close search"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          {/* Subtitle / Question */}
          <p className="text-xs font-medium text-[#5A4A52] tracking-wide -mt-1">
            What are you looking for?
          </p>

          {/* Search Input Form (Pink bordered rounded-full pill) */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="w-full flex items-center border-2 border-[#ff0080] rounded-full px-3.5 py-2.5 bg-white transition-all shadow-xs">
              <Search size={18} className="text-[#ff0080] shrink-0 mr-2.5" strokeWidth={2} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#222] placeholder:text-[#888] outline-none"
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
          <div className="px-4 pb-4 pt-1 border-t border-[#F7E7EC] flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
            <span className="text-[11px] font-semibold text-[#8C7B82] uppercase tracking-wider">
              Matching Products ({matchingSuggestions.length})
            </span>
            <div className="divide-y divide-[#F7E7EC]">
              {matchingSuggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item.slug)}
                  className="flex items-center gap-3 py-2 cursor-pointer hover:bg-[#FFF5F8] -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="relative w-11 h-11 rounded-md overflow-hidden bg-[#f5f5f5] shrink-0 border border-[#F2E6EC]">
                    <Image
                      src={item.images?.[0]?.src || "/file.svg"}
                      alt={item.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#222] truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] font-semibold text-[#ff0080]">
                      Tk {parseFloat(item.price).toLocaleString()}
                      {item.sku && (
                        <span className="ml-1.5 text-[10px] text-[#8C7B82] font-normal">
                          SKU: {item.sku}
                        </span>
                      )}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-[#bbb] shrink-0" />
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5EAEF] bg-white">
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#444] hover:text-[#ff0080] hover:bg-[#FAF2F5] transition-colors"
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-[#ff0080] bg-[#FFF5F8]"
                      : "text-slate-600 hover:text-[#ff0080] hover:bg-[#FFF5F8]"
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight size={15} className={active ? "text-[#ff0080]" : "text-slate-600"} />
                </Link>
              );
            })}
          </nav>

          {/* Clean Divider */}
          <div className="h-[1px] bg-[#F5EAEF]" />

          {/* Shop Categories Section */}
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-[#9C8991] px-3 mb-2">
              Categories
            </p>
            <nav className="flex flex-col space-y-0.5">
              {categories.map((cat) => {
                const catHref = `/category/${cat.label.toLowerCase().replace(/\s+/g, "-")}`;
                const active = pathname === catHref;
                return (
                  <Link
                    key={cat.label}
                    href={catHref}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${
                      active
                        ? "text-[#ff0080] bg-[#FFF5F8]"
                        : "text-slate-600 hover:text-[#ff0080] hover:bg-[#FFF5F8]"
                    }`}
                  >
                    <span className="font-normal">{cat.label}</span>
                    <ChevronRight size={13} className={active ? "text-[#ff0080]" : "text-slate-600"} />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Clean Divider */}
          <div className="h-[1px] bg-[#F5EAEF]" />

          {/* Quick Access Icons */}
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-[#9C8991] px-3 mb-2">
              Account & Saved
            </p>
            <div className="grid grid-cols-3 gap-2 px-1">
              <Link
                href="/wishlist"
                onClick={() => setDrawerOpen(false)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-xs font-medium gap-1.5 transition-colors ${
                  pathname === "/wishlist"
                    ? "border-[#ff0080] text-[#ff0080] bg-[#FFF5F8]"
                    : "border-[#F2E6EC] hover:border-[#ff0080] hover:text-[#ff0080] text-slate-600"
                }`}
              >
                <Heart size={16} strokeWidth={1.75} />
                <span>Wishlist</span>
              </Link>
              <Link
                href="/shop"
                onClick={() => setDrawerOpen(false)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-xs font-medium gap-1.5 transition-colors ${
                  pathname === "/shop"
                    ? "border-[#ff0080] text-[#ff0080] bg-[#FFF5F8]"
                    : "border-[#F2E6EC] hover:border-[#ff0080] hover:text-[#ff0080] text-slate-600"
                }`}
              >
                <ArrowLeftRight size={16} strokeWidth={1.75} />
                <span>Compare</span>
              </Link>
              <Link
                href="/account"
                onClick={() => setDrawerOpen(false)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-xs font-medium gap-1.5 transition-colors ${
                  pathname === "/account"
                    ? "border-[#ff0080] text-[#ff0080] bg-[#FFF5F8]"
                    : "border-[#F2E6EC] hover:border-[#ff0080] hover:text-[#ff0080] text-slate-600"
                }`}
              >
                <User size={16} strokeWidth={1.75} />
                <span>Account</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Clean Drawer Footer */}
        <div className="p-4 border-t border-[#F5EAEF] bg-white flex flex-col gap-2">
          <a
            href="/signin"
            onClick={() => setDrawerOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 !bg-[#ff0080] hover:!bg-[#d4006a] !text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <LogIn size={15} className="!text-white shrink-0" />
            <span className="!text-white text-inherit">Sign In</span>
          </a>
          <a
            href="/signup"
            onClick={() => setDrawerOpen(false)}
            className="w-full py-2 text-center text-xs font-medium text-[#7A6971] hover:text-[#ff0080] transition-colors"
          >
            Create an Account
          </a>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav (disabled) ─────────────── */}
      {/* <nav className="bottom-nav mobile-only" aria-label="Bottom navigation">
        <a href="/" className="bottom-nav-item active">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </a>
        <a href="/shop" className="bottom-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>Shop</span>
        </a>
        <a href="/cart" className="bottom-nav-item bottom-nav-cart">
          <div className="bottom-cart-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className="cart-badge" aria-hidden="true">{cartCount}</span>}
          </div>
        </a>
        <a href="/wishlist" className="bottom-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>Wishlist</span>
        </a>
        <a href="/account" className="bottom-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </a>
      </nav> */}
    </>
  );
}
