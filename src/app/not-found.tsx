import Link from "next/link";
import { Sparkles, Home, ShoppingBag, Search } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | luxuryladies",
  description: "The page you are looking for cannot be found. Browse our luxury footwear, handbags, and accessories.",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] md:min-h-[78vh] w-full bg-[#FAFAFA] flex flex-col justify-center items-center relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      {/* ── Ambient Luxury Glow Accents ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-[#E91E63]/10 via-[#FF4081]/5 to-transparent rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-xl mx-auto w-full text-center relative z-10">
        {/* ── Brand Badge ── */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E2E5] shadow-xs mb-6 animate-pulse">
          <Sparkles size={14} className="text-[#E91E63]" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#E91E63]">
            Error 404 • Lost in Luxury
          </span>
        </div>

        {/* ── Big Gradient 404 Visual ── */}
        <div className="relative mb-4">
          <h1 className="text-8xl sm:text-9xl md:text-[11rem] font-extrabold tracking-tight bg-gradient-to-r from-[#E91E63] via-[#FF4081] to-[#C2185B] bg-clip-text text-transparent select-none drop-shadow-xs">
            404
          </h1>
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center">
            <span className="px-4 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold text-[#6F6470] border border-[#E8E2E5] shadow-xs">
              Page Not Found
            </span>
          </div>
        </div>

        {/* ── Headings ── */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#191426] tracking-tight mb-3">
          Looks Like This Page Is Out Of Style
        </h2>
        <p className="text-sm sm:text-base text-[#6F6470] leading-relaxed max-w-lg mx-auto mb-8">
          The page or luxury piece you are looking for might have been retired, renamed, or is temporarily out of reach in our boutique.
        </p>

        {/* ── Direct Search Box ── */}
        <div className="max-w-md mx-auto w-full mb-8">
          <form
            action="/shop"
            method="GET"
            className="relative flex items-center bg-white rounded-full border border-[#E8E2E5] shadow-xs focus-within:border-[#E91E63] focus-within:ring-2 focus-within:ring-[#E91E63]/15 transition-all p-1.5"
          >
            <div className="pl-3.5 pr-2 text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              name="q"
              placeholder="Search heels, bags, sleepwear..."
              className="w-full bg-transparent text-sm text-[#191426] placeholder:text-[#6F6470] focus:outline-hidden pr-2"
              required
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-full !bg-[#E91E63] hover:!bg-[#C2185B] !text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* ── Primary Action Buttons ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-full !bg-[#E91E63] hover:!bg-[#C2185B] !text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Home size={16} className="!text-white" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/shop"
            className="px-6 py-3 rounded-full bg-white hover:bg-[#FFF5F7] text-[#191426] hover:text-[#E91E63] border border-[#E8E2E5] hover:border-[#E91E63] text-xs sm:text-sm font-semibold shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag size={16} />
            <span>Explore Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
