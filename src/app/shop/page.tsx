import { Suspense } from "react";
import { Metadata } from "next";
import ShopArchive from "@/components/ShopArchive";
import ShopSkeleton from "@/components/ShopSkeleton";
import { allProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop All Products | luxuryladies",
  description: "Browse our complete collection of luxury heels, bags, clutches, and sets with price and category filters.",
};

interface ShopPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

async function ShopContent({ searchParams }: ShopPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams?.q || "";

  return (
    <div className="w-full bg-[#FAFAFA]">
      <ShopArchive initialProducts={allProducts} initialSearchQuery={query} />
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
