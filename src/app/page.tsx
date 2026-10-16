import Image from "next/image";
import Link from "next/link";
import { ChevronRight as ChevronNext } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";
import { getProducts, getCategories, getGeneralSettings } from "@/lib/woocommerce";

export default async function Home() {
  const [allProducts, generalSettings, fetchedCategories] = await Promise.all([
    getProducts({ per_page: 100 }),
    getGeneralSettings(),
    getCategories(),
  ]);

  // 1. Hero Gallery Images from WordPress plugin general-settings
  const heroGallery = generalSettings?.hero_gallery && generalSettings.hero_gallery.length > 0
    ? generalSettings.hero_gallery
    : [{ id: 0, url: "/hero-bg.png", alt: "Anniversary Luxury Collection - luxuryladies" }];

  // 2. Categories for the "Shop by Category" section from WordPress plugin general-settings
  const rawShopCategories = generalSettings?.shop_by_categories && generalSettings.shop_by_categories.length > 0
    ? generalSettings.shop_by_categories
    : generalSettings?.featured_categories && generalSettings.featured_categories.length > 0
    ? generalSettings.featured_categories
    : fetchedCategories;

  const categories = rawShopCategories.map((c: any) => {
    // If WooCommerce category has an uploaded image URL, use it; otherwise fallback to first product image or placeholder
    const catProductImg = allProducts.find((p) =>
      p.categories?.some((cat) => cat.slug === c.slug || cat.id === c.id)
    )?.images?.[0]?.src;

    let imageUrl = "/woocommerce-placeholder.webp";
    if (typeof c.image === "string" && c.image.trim()) {
      imageUrl = c.image;
    } else if (c.image && typeof c.image === "object" && c.image.src) {
      imageUrl = c.image.src;
    } else if (catProductImg) {
      imageUrl = catProductImg;
    }

    return {
      id: c.slug || String(c.id),
      name: c.name,
      href: `/category/${c.slug}`,
      image: imageUrl,
    };
  });

  // 3. Landing Page Category Product Groups from WordPress plugin general-settings
  const landingCategories = generalSettings?.landing_page_categories && generalSettings.landing_page_categories.length > 0
    ? generalSettings.landing_page_categories
    : fetchedCategories.slice(0, 4);

  return (
    <div className="w-full">
      {/* ── Full Width Hero Section Gallery ── */}
      <HeroBanner images={heroGallery} />

      {/* ── Main Content Container ── */}
      <div className="container py-10 md:py-14">
        {/* ── Category Section Header ── */}
        {categories.length > 0 && (
          <>
            <div className="text-center mb-6">
              <span className="text-[11px] md:text-xs font-semibold tracking-[0.25em] text-description uppercase block mb-2">
                CURATED COLLECTIONS
              </span>
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-dark">
                Shop by Category
              </h2>
              <div className="w-12 h-[1px] bg-border mx-auto mt-3" />
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

        {/* ── Product Grids for configured Landing Page Categories ── */}
        {landingCategories.map((cat: any) => {
          const categoryProducts = allProducts.filter((p) =>
            p.categories?.some((c) => c.slug === cat.slug || c.id === cat.id)
          );

          if (categoryProducts.length === 0) return null;

          return (
            <section key={cat.id || cat.slug} className="mt-14 md:mt-20">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <h2 className="text-xl md:text-2xl font-medium tracking-tight text-dark">
                  {cat.name}
                </h2>
                <Link
                  href={`/category/${cat.slug}`}
                  className="text-xs md:text-sm font-medium text-description hover:!text-primary inline-flex items-center gap-0.5 transition-colors group cursor-pointer"
                >
                  <span className="hover:!text-primary">See More</span>
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
