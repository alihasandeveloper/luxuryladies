import { Metadata } from "next";
import ShopArchive from "@/components/ShopArchive";
import { allProducts } from "@/data/products";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const readableName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${readableName} | Cloudy BD / NextCart`,
    description: `Shop the latest ${readableName} collection at Cloudy BD.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen">
      <ShopArchive initialProducts={allProducts} categorySlug={slug} />
    </div>
  );
}
