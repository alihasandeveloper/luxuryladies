import Image from "next/image";
import Link from "next/link";
import { ChevronRight as ChevronNext } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { hotDealsProducts, goldenPicksProducts } from "@/data/products";

interface Category {
  id: string;
  name: string;
  href: string;
  image: string;
}

const categories: Category[] = [
  {
    id: "golden-picks",
    name: "GOLDEN PICKS",
    href: "/category/golden-picks",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "luxury-edit-heels",
    name: "LUXURY EDIT HEELS",
    href: "/category/luxury-edit-heels",
    image: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "luxury-bags",
    name: "LUXURY BAGS",
    href: "/category/luxury-bags",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "party-clutch",
    name: "PARTY CLUTCH",
    href: "/category/party-clutch",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "z-style-heels",
    name: "Z-STYLE HEELS",
    href: "/category/z-style-heels",
    image: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "2-pcs-pj-sets",
    name: "2 PCS PJ SETS",
    href: "/category/2-pcs-pj-sets",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "flats-sandals",
    name: "FLATS & SANDALS",
    href: "/category/flats-sandals",
    image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "3-pcs-pj-sets",
    name: "3 PCS PJ SETS",
    href: "/category/3-pcs-pj-sets",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "clearance-sale",
    name: "CLEARANCE SALE!!!",
    href: "/category/clearance-sale",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80",
  },
];

export default function Home() {
  return (
    <div className="w-full">
      {/* ── Full Width Hero Section: Responsive on mobile, 708px on desktop ── */}
      <section className="w-full relative h-[240px] sm:h-[380px] md:h-[520px] lg:h-[708px] overflow-hidden bg-[#FFF5F8]">
        <Image
          src="/anniversary-banner.jpeg"
          alt="Anniversary Luxury Collection - NextCart"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </section>

      {/* ── Main Content Container ── */}
      <div className="container py-10 md:py-14">
        {/* ── Section Header ── */}
        <div className="text-center mb-6">
          <span className="text-[11px] md:text-xs font-semibold tracking-[0.25em] text-[lab(35.6337%_-1.58697_-10.8425)] uppercase block mb-2">
            CURATED COLLECTIONS
          </span>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#251A1F]">
            Shop by Category
          </h2>
          {/* Subtle decorative divider line */}
          <div className="w-12 h-[1px] bg-[#EDE0E5] mx-auto mt-3" />
        </div>

        {/* ── Category Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative block aspect-[3/4] overflow-hidden bg-slate-100"
            >
              {/* Category Image */}
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Bottom translucent overlay matching reference image */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

              {/* Title & horizontal accent line over image */}
              <div className="absolute inset-x-0 bottom-4 px-3 text-center flex flex-col items-center justify-end gap-2 z-20 pointer-events-none">
                <span className="w-6 h-[1px] bg-white/90 mb-2.5 inline-block" />
                <h3 className="text-[11px] md:text-xs font-medium tracking-[0.16em] !text-white uppercase leading-normal line-clamp-2 select-none">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Hot Deals Section ── */}
        <section className="mt-14 md:mt-20">
          <div className="mb-4 md:mb-5">
            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[#251A1F]">
              Hot deals
            </h2>
          </div>

          {/* Hot Deals Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-4">
            {hotDealsProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ── Golden Picks Section ── */}
        <section className="mt-14 md:mt-20">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[#251A1F]">
              Golden Picks
            </h2>
            <Link
              href="/category/golden-picks"
              className="text-xs md:text-sm font-medium text-[#555] hover:!text-[#ff0080] inline-flex items-center gap-0.5 transition-colors group cursor-pointer"
            >
              <span className="hover:!text-[#ff0080]">See More</span>
              <ChevronNext
                size={15}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {/* Golden Picks Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-4">
            {goldenPicksProducts.map((product) => (
              <ProductCard key={product.id} product={product} showWishlist />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
