import { Metadata } from "next";
import ShopArchive from "@/components/ShopArchive";
import { getProducts, getCategories } from "@/lib/woocommerce";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const matched = categories.find((c) => c.slug === slug);
  const readableName =
    matched?.name ||
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return {
    title: `${readableName} | luxuryladies`,
    description: `Shop the latest ${readableName} collection at luxuryladies.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="w-full bg-[#FAFAFA]">
      <ShopArchive initialProducts={products} categories={categories} categorySlug={slug} />
    </div>
  );
}
