import { Suspense } from "react";
import { Metadata } from "next";
import ShopArchive from "@/components/ShopArchive";
import { allProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop All Products | Cloudy BD / NextCart",
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
    <div className="w-full bg-[#FAFAFA] min-h-screen">
      <ShopArchive initialProducts={allProducts} initialSearchQuery={query} />
    </div>
  );
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-[#FAFAFA] min-h-screen flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#ff0080] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}
