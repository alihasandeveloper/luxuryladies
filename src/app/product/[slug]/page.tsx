import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/ProductDetails";
import { allProducts } from "@/data/products";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = allProducts.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found | luxuryladies",
    };
  }

  return {
    title: `${product.name} | luxuryladies`,
    description:
      product.description ||
      product.short_description ||
      `Buy ${product.name} at luxuryladies. Best price, cash on delivery available.`,
  };
}

export default async function SingleProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = allProducts.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Get related products (same category or others)
  const productCatSlug = product.categories?.[0]?.slug;
  const relatedProducts = allProducts.filter((p) => p.id !== product.id);

  // If products share same category, put them first
  if (productCatSlug) {
    relatedProducts.sort((a, b) => {
      const aMatches = a.categories?.some((c) => c.slug === productCatSlug) ? 1 : 0;
      const bMatches = b.categories?.some((c) => c.slug === productCatSlug) ? 1 : 0;
      return bMatches - aMatches;
    });
  }

  return <ProductDetails product={product} relatedProducts={relatedProducts} />;
}
