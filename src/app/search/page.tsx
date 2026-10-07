import { Suspense } from "react";
import { Metadata } from "next";
import ShopArchive from "@/components/ShopArchive";
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
    <div className="w-full bg-[#FAFAFA] min-h-screen">
      <ShopArchive initialProducts={allProducts} initialSearchQuery={query} />
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-[#FAFAFA] min-h-screen flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#ff0080] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchArchiveContent searchParams={searchParams} />
    </Suspense>
  );
}
