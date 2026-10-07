"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const [cartCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileSearchOpen(false);
  };

  return (
    <>
      <header className="site-header">
        {/* ── Top Bar ─────────────────────────────────── */}
        <div className="header-top">
          <div className="container header-top-inner">

            {/* Hamburger / Menu (mobile only) */}
            <button
              className="hamburger-btn"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={22} strokeWidth={1.85} className="text-[#1f161b] hover:text-[#ff0080] transition-colors" />
            </button>

            {/* Logo (200x60px) */}
            <a href="/" className="header-logo inline-flex items-center" aria-label="luxuryladies Home">
              <Image
                src="/luxuryladies-logo.png"
                alt="luxuryladies"
                width={200}
                height={60}
                priority
                className="w-[180px] md:w-[200px] h-[54px] md:h-[60px] object-contain"
              />
            </a>

            {/* Main Nav (desktop only) */}
            <nav className="header-nav desktop-only" aria-label="Main navigation">
              <ul>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
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

            {/* Search icon (mobile only) */}
            <button
              className="action-btn mobile-search-btn mobile-only"
              aria-label="Toggle search"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
            >
              <Search size={19} strokeWidth={1.75} />
            </button>

            {/* Icon Actions */}
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

          {/* Mobile Search Bar Dropdown */}
          {mobileSearchOpen && (
            <div className="mobile-only px-4 pb-3 pt-1 border-t border-[#F7E7EC] bg-white">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 border border-[#E5D7DD] rounded-full px-3 py-2 bg-[#FAF7F8] focus-within:border-[#ff0080] focus-within:bg-white transition-all">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#222] placeholder:text-[#999] outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={13} />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-[#ff0080] text-white rounded-full text-xs font-semibold shrink-0"
                >
                  Go
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── Category Bar (desktop only) ──────────────── */}
        <nav className="header-categories desktop-only" aria-label="Category navigation">
          <div className="container">
            <ul>
              {categories.map((cat) => (
                <li key={cat.label}>
                  <a href={`/category/${cat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    {cat.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

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
          <a href="/" onClick={() => setDrawerOpen(false)} className="inline-flex items-center">
            <Image
              src="/luxuryladies-logo.png"
              alt="luxuryladies"
              width={140}
              height={42}
              className="h-8 w-auto object-contain"
            />
          </a>
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
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#1A1A1A] hover:text-[#ff0080] hover:bg-[#FFF5F8] transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight size={15} className="text-[#B39DA7]" />
              </a>
            ))}
          </nav>

          {/* Clean Divider */}
          <div className="h-[1px] bg-[#F5EAEF]" />

          {/* Shop Categories Section */}
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-[#9C8991] px-3 mb-2">
              Categories
            </p>
            <nav className="flex flex-col space-y-0.5">
              {categories.map((cat) => (
                <a
                  key={cat.label}
                  href={`/category/${cat.label.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[13px] text-[#4A3E44] hover:text-[#ff0080] hover:bg-[#FFF5F8] transition-colors"
                >
                  <span className="font-normal">{cat.label}</span>
                  <ChevronRight size={13} className="text-[#D4C4CB]" />
                </a>
              ))}
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
              <a
                href="/wishlist"
                onClick={() => setDrawerOpen(false)}
                className="flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border border-[#F2E6EC] hover:border-[#ff0080] hover:text-[#ff0080] text-[#444] text-xs font-medium gap-1.5 transition-colors"
              >
                <Heart size={16} strokeWidth={1.75} />
                <span>Wishlist</span>
              </a>
              <a
                href="/shop"
                onClick={() => setDrawerOpen(false)}
                className="flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border border-[#F2E6EC] hover:border-[#ff0080] hover:text-[#ff0080] text-[#444] text-xs font-medium gap-1.5 transition-colors"
              >
                <ArrowLeftRight size={16} strokeWidth={1.75} />
                <span>Compare</span>
              </a>
              <a
                href="/account"
                onClick={() => setDrawerOpen(false)}
                className="flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border border-[#F2E6EC] hover:border-[#ff0080] hover:text-[#ff0080] text-[#444] text-xs font-medium gap-1.5 transition-colors"
              >
                <User size={16} strokeWidth={1.75} />
                <span>Account</span>
              </a>
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
