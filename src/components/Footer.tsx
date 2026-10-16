"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, Home, ShoppingBag, Heart, User, SlidersHorizontal } from "lucide-react";
import { useCart } from "@/context/CartContext";

const collections = [
  { label: "New Arrivals", href: "/new-arrivals", highlight: true },
  { label: "Luxury Heels", href: "/luxury-heels" },
  { label: "Luxury Bags", href: "/luxury-bags" },
  { label: "Party Clutch", href: "/party-clutch" },
  { label: "Flats & Sandals", href: "/flats-sandals" },
];

const support = [
  { label: "Pre-Order Policy", href: "/pre-order-policy" },
  { label: "Custom Orders", href: "/custom-orders" },
  { label: "Shipping Info", href: "/shipping-info" },
  { label: "Returns & Exchange", href: "/returns-exchange" },
];

const contactInfo = [
  {
    icon: <Phone size={15} strokeWidth={1.75} />,
    label: "CALL US",
    value: "+8801XXXXXXXX",
    href: "tel:+8801XXXXXXXX",
  },
  {
    icon: <Mail size={15} strokeWidth={1.75} />,
    label: "EMAIL US",
    value: "support@luxuryladies.com",
    href: "mailto:support@luxuryladies.com",
  },
  {
    icon: <MapPin size={15} strokeWidth={1.75} />,
    label: "VISIT US",
    value: "Dottobari, Bogura",
    href: "https://maps.google.com",
  },
];

const bottomLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Support Center", href: "/support" },
];

export default function Footer() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const isShopPage =
    pathname === "/shop" ||
    pathname.startsWith("/shop/") ||
    pathname.startsWith("/category/") ||
    pathname === "/search";

  return (
    <footer className="site-footer">
      {/* Gradient top line */}
      <div className="footer-gradient-line" />

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container footer-grid">

          {/* ── Brand Column ── */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo inline-flex items-center" aria-label="luxuryladies Home">
              <Image
                src="/luxuryladies-logo.png"
                alt="luxuryladies"
                width={260}
                height={78}
                className="w-[210px] md:w-[250px] lg:w-[260px] h-auto object-contain"
              />
            </Link>
            <p className="footer-desc mt-3">
              Redefining contemporary women&apos;s luxury fashion. Premium heels, chic bags, party clutches, and curated sleepwear crafted for modern elegance.
            </p>
            {/* Socials */}
            <div className="footer-socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Collections Column ── */}
          <div className="footer-col">
            <h4 className="footer-col-title">Collections</h4>
            <ul>
              {collections.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={item.highlight ? "footer-link footer-link-highlight" : "footer-link"}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support Column ── */}
          <div className="footer-col">
            <h4 className="footer-col-title">Support</h4>
            <ul>
              {support.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="footer-link">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Get In Touch Column ── */}
          <div className="footer-col">
            <h4 className="footer-col-title">Get In Touch</h4>
            <ul className="footer-contact-list">
              {contactInfo.map((info) => (
                <li key={info.label} className="footer-contact-item">
                  <span className="footer-contact-icon">{info.icon}</span>
                  <div>
                    <p className="footer-contact-label">{info.label}</p>
                    <a href={info.href} className="footer-contact-value">{info.value}</a>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer-bottom pb-20 md:pb-4">
        <div className="container footer-bottom-inner flex flex-col-reverse md:flex-row items-center text-center md:text-left justify-between">
          <p className="footer-copy text-center md:text-left w-full md:w-auto">
            © 2026 luxuryladies. All rights reserved.{" "}
            <span className="block sm:inline mt-0.5 sm:mt-0">
              Designed &amp; Developed by <strong>Ali Hasan</strong>
            </span>
          </p>
          <nav className="footer-bottom-links justify-center md:justify-start flex-wrap w-full md:w-auto">
            {bottomLinks.map((link, i) => (
              <span key={link.href} className="footer-bottom-link-wrap">
                {i > 0 && <span className="footer-bottom-sep">|</span>}
                <Link href={link.href} className="footer-bottom-link">{link.label}</Link>
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-border flex md:hidden items-center justify-around px-2 py-2 shadow-[0_-4px_20px_rgba(25,20,38,0.06)] print:hidden"
        aria-label="Mobile Bottom Navigation"
      >
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 text-[11px] font-medium transition-colors ${
            pathname === "/" ? "text-primary font-semibold" : "text-description hover:text-dark"
          }`}
        >
          <Home size={20} strokeWidth={pathname === "/" ? 2.3 : 1.8} />
          <span>Home</span>
        </Link>

        {isShopPage ? (
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-mobile-filter"));
              document.getElementById("mobile-filter-open-btn")?.click();
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-[11px] font-medium transition-colors text-primary font-semibold cursor-pointer"
            aria-label="Open Filters"
          >
            <SlidersHorizontal size={20} strokeWidth={2.3} />
            <span>Filters</span>
          </button>
        ) : (
          <Link
            href="/shop"
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-[11px] font-medium transition-colors text-description hover:text-dark"
          >
            <ShoppingBag size={20} strokeWidth={1.8} />
            <span>Shop</span>
          </Link>
        )}

        <Link
          href="/cart"
          className={`relative flex flex-col items-center justify-center gap-1 py-1 px-3 text-[11px] font-medium transition-colors ${
            pathname === "/cart" ? "text-primary font-semibold" : "text-description hover:text-dark"
          }`}
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={pathname === "/cart" ? 2.3 : 1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </Link>

        <Link
          href="/about"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 text-[11px] font-medium transition-colors ${
            pathname === "/about" ? "text-primary font-semibold" : "text-description hover:text-dark"
          }`}
        >
          <Heart size={20} strokeWidth={pathname === "/about" ? 2.3 : 1.8} />
          <span>Wishlist</span>
        </Link>

        <Link
          href="/checkout"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 text-[11px] font-medium transition-colors ${
            pathname === "/checkout" ? "text-primary font-semibold" : "text-description hover:text-dark"
          }`}
        >
          <User size={20} strokeWidth={pathname === "/checkout" ? 2.3 : 1.8} />
          <span>Profile</span>
        </Link>
      </nav>
    </footer>
  );
}
