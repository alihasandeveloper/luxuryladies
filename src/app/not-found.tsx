import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/woocommerce";

export const metadata = {
  title: "404 - Page Not Found | luxuryladies",
  description: "The page you are looking for could not be found.",
};

export default async function NotFound() {
  const products = await getProducts({ per_page: 10 });

  return (
    <div className="w-full py-10 md:py-16">
      <div className="container">
        {/* ── Minimalist 404 Notice ── */}
        <div className="max-w-md mx-auto text-center py-6 md:py-8">
          <p className="text-4xl md:text-5xl font-light tracking-tight text-primary mb-2">
            404
          </p>
          <h1 className="text-xl md:text-2xl font-medium text-dark mb-2">
            Page Not Found
          </h1>
          <p className="text-xs md:text-sm text-description mb-6 leading-relaxed">
            The page you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-2.5 bg-primary hover:bg-primary-hover !text-white text-xs font-bold rounded-none shadow-xs uppercase tracking-wider transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* ── You Also Like & Product Grid ── */}
        {products.length > 0 && (
          <section className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-border">
            <div className="text-center mb-6 md:mb-8">
              <span className="text-[11px] font-semibold tracking-[0.25em] text-description uppercase block mb-1.5">
                RECOMMENDED FOR YOU
              </span>
              <h2 className="text-xl md:text-2xl font-medium tracking-tight text-dark">
                You Also Like
              </h2>
              <div className="w-12 h-[1px] bg-border mx-auto mt-2.5" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4">
              {products.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} showWishlist />
              ))}
            </div>

            {/* See More Button matching Product Details page */}
            <div className="text-center mt-8 md:mt-10">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-2.5 bg-primary hover:bg-primary-hover !text-white text-xs font-bold rounded-none shadow-xs uppercase tracking-wider transition-colors"
              >
                See More
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
