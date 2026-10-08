import { Suspense } from "react";
import { Metadata } from "next";
import ShopArchive from "@/components/ShopArchive";
import ShopSkeleton from "@/components/ShopSkeleton";
import { allProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Search Results | luxuryladies",
  description: "Search products in luxury heels, bags, clutches, and sets with instant price and category filters.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

async function SearchArchiveContent({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || "";

  return (
    <div className="w-full bg-[#FAFAFA]">
      <ShopArchive initialProducts={allProducts} initialSearchQuery={query} />
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <SearchArchiveContent searchParams={searchParams} />
    </Suspense>
  );
}
