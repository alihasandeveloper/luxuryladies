import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

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
    value: "support@nextcart.com",
    href: "mailto:support@nextcart.com",
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
  return (
    <footer className="site-footer">
      {/* Gradient top line */}
      <div className="footer-gradient-line" />

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container footer-grid">

          {/* ── Brand Column ── */}
          <div className="footer-brand">
            <a href="/" className="footer-logo inline-flex items-center" aria-label="luxuryladies Home">
              <Image
                src="/luxuryladies-logo.png"
                alt="luxuryladies"
                width={260}
                height={78}
                className="w-[210px] md:w-[250px] lg:w-[260px] h-auto object-contain"
              />
            </a>
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
                  <a
                    href={item.href}
                    className={item.highlight ? "footer-link footer-link-highlight" : "footer-link"}
                  >
                    {item.label}
                  </a>
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
                  <a href={item.href} className="footer-link">{item.label}</a>
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
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">
            © 2026 NextCart. All rights reserved.{" "}
            <span>Designed &amp; Developed by <strong>NextCart Team</strong></span>
          </p>
          <nav className="footer-bottom-links">
            {bottomLinks.map((link, i) => (
              <span key={link.href} className="footer-bottom-link-wrap">
                {i > 0 && <span className="footer-bottom-sep">|</span>}
                <a href={link.href} className="footer-bottom-link">{link.label}</a>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
