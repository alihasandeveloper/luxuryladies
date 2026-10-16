import { Suspense } from "react";
import { Metadata } from "next";
import ShopArchive from "@/components/ShopArchive";
import ShopSkeleton from "@/components/ShopSkeleton";
import { getProducts, getCategories, getOffers } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Shop All Products | luxuryladies",
  description: "Browse our complete collection of luxury heels, bags, clutches, and sets with price and category filters.",
};

interface ShopPageProps {
  searchParams?: Promise<{
    q?: string;
    offer?: string;
  }>;
}

async function ShopContent({ searchParams }: ShopPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams?.q || "";
  const offer = resolvedParams?.offer || "";

  const [products, categories, offers] = await Promise.all([
    getProducts({ search: query, per_page: 12, page: 1 }),
    getCategories(),
    getOffers(),
  ]);

  return (
    <div className="w-full">
      <ShopArchive
        initialProducts={products}
        categories={categories}
        offers={offers}
        initialSearchQuery={query}
        initialOfferSlug={offer}
      />
    </div>
  );
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}
