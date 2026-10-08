import Image from "next/image";
import Link from "next/link";
import { ChevronRight as ChevronNext } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/woocommerce";

export default async function Home() {
  const [allProducts, fetchedCategories] = await Promise.all([
    getProducts({ per_page: 50 }),
    getCategories(),
  ]);

  // Categories for the "Shop by Category" section
  const categories = fetchedCategories.map((c) => {
    // If WooCommerce category has an uploaded image, use it; otherwise use first product image from that category
    const catProductImg = allProducts.find((p) =>
      p.categories?.some((cat) => cat.slug === c.slug)
    )?.images?.[0]?.src;

    return {
      id: c.slug,
      name: c.name,
      href: `/category/${c.slug}`,
      image: c.image?.src || catProductImg || "/woocommerce-placeholder.webp",
    };
  });

  // Take the first 2-3 categories to render product grids
  const topCategories = fetchedCategories.slice(0, 3);

  return (
    <div className="w-full">
      {/* ── Full Width Hero Section ── */}
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
        {/* ── Category Section Header ── */}
        {categories.length > 0 && (
          <>
            <div className="text-center mb-6">
              <span className="text-[11px] md:text-xs font-semibold tracking-[0.25em] text-slate-600 uppercase block mb-2">
                CURATED COLLECTIONS
              </span>
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#251A1F]">
                Shop by Category
              </h2>
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
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-4 px-3 text-center flex flex-col items-center justify-end gap-2 z-20 pointer-events-none">
                    <span className="w-6 h-[1px] bg-white/90 mb-2.5 inline-block" />
                    <h3 className="text-[11px] md:text-xs font-medium tracking-[0.16em] !text-white uppercase leading-normal line-clamp-2 select-none">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ── Product Grids for the first 2-3 categories from WooCommerce ── */}
        {topCategories.map((cat) => {
          const categoryProducts = allProducts.filter((p) =>
            p.categories?.some((c) => c.slug === cat.slug)
          );

          if (categoryProducts.length === 0) return null;

          return (
            <section key={cat.id} className="mt-14 md:mt-20">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[#251A1F]">
                  {cat.name}
                </h2>
                <Link
                  href={`/category/${cat.slug}`}
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

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 md:gap-4">
                {categoryProducts.slice(0, 5).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
