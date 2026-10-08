import { WooCommerceCategory, WooCommerceProduct, WooCommerceImage } from "@/types/woocommerce";

// Allow self-signed certificates in development for local WordPress installations (e.g. headless.local)
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const WP_URL = process.env.WP_BACKEND_URL || "https://headless.local";
const WP_CK = process.env.WP_CK || "";
const WP_CS = process.env.WP_CS || "";

function getAuthHeader(): string {
  if (!WP_CK || !WP_CS) return "";
  return "Basic " + Buffer.from(`${WP_CK}:${WP_CS}`).toString("base64");
}

function getBaseUrl(): string {
  let url = WP_URL.trim().replace(/\/+$/, "");
  // If it's headless.local on http, upgrade to https because WooCommerce REST API requires SSL for Basic Auth
  if (url.startsWith("http://headless.local")) {
    url = url.replace("http://", "https://");
  }
  return url;
}

export const DEFAULT_PRODUCT_PLACEHOLDER = "/woocommerce-placeholder.webp";

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function normalizeProduct(raw: any): WooCommerceProduct {
  const catName = raw.categories?.[0]?.name ? decodeHtml(raw.categories[0].name) : "Luxury Collection";

  // Normalize categories
  const categories: WooCommerceCategory[] = (raw.categories || []).map((c: any) => ({
    id: c.id,
    name: decodeHtml(c.name || ""),
    slug: c.slug || "",
    image: c.image ? { src: c.image.src, alt: c.image.alt || c.name } : null,
  }));

  // Normalize images
  let images: WooCommerceImage[] = (raw.images || [])
    .filter((img: any) => Boolean(img?.src))
    .map((img: any) => ({
      id: img.id || Math.floor(Math.random() * 10000),
      src: img.src,
      name: img.name || raw.name || "Product Image",
      alt: img.alt || raw.name || "Product Image",
    }));

  if (images.length === 0) {
    images = [
      {
        id: raw.id || 1,
        src: DEFAULT_PRODUCT_PLACEHOLDER,
        name: raw.name || "Product",
        alt: raw.name || "Product",
      },
    ];
  }

  const regularPrice = raw.regular_price || raw.price || "0";
  const salePrice = raw.sale_price || raw.price || regularPrice;
  const price = raw.price || salePrice || regularPrice;

  return {
    id: raw.id,
    name: decodeHtml(raw.name || "Untitled Product"),
    slug: raw.slug || `product-${raw.id}`,
    permalink: raw.permalink,
    type: raw.type || "simple",
    status: raw.status || "publish",
    featured: Boolean(raw.featured),
    catalog_visibility: raw.catalog_visibility || "visible",
    description:
      raw.description ||
      `<p>Discover the elegance of <strong>${decodeHtml(raw.name || "")}</strong>. Handcrafted with premium materials, designed for style and comfort.</p>`,
    short_description:
      raw.short_description ||
      `Premium ${decodeHtml(raw.name || "")} from luxuryladies. Crafted for everyday elegance, comfort, and premium style.`,
    sku: raw.sku || `SKU-${raw.id}`,
    price: String(price),
    regular_price: String(regularPrice),
    sale_price: String(salePrice),
    on_sale: Boolean(raw.on_sale || (regularPrice && salePrice && Number(regularPrice) > Number(salePrice))),
    purchasable: raw.purchasable ?? true,
    total_sales: raw.total_sales || 0,
    stock_status: (raw.stock_status as any) || "instock",
    categories,
    images,
    attributes: raw.attributes || [],
    meta_data: raw.meta_data || [],
  };
}

/**
 * Fetch all products from WooCommerce REST API
 */
export async function getProducts(params?: {
  per_page?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<WooCommerceProduct[]> {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      console.warn("WooCommerce credentials not provided.");
      return [];
    }

    const query = new URLSearchParams();
    query.set("per_page", String(params?.per_page || 100));
    query.set("status", "publish");
    if (params?.search) query.set("search", params.search);
    if (params?.featured !== undefined) query.set("featured", String(params.featured));

    // If category slug is provided, find its category ID first
    if (params?.category) {
      const cats = await getCategories();
      const matched = cats.find((c) => c.slug === params.category);
      if (matched) {
        query.set("category", String(matched.id));
      }
    }

    const res = await fetch(`${getBaseUrl()}/wp-json/wc/v3/products?${query.toString()}`, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.error(`WooCommerce API error ${res.status}: ${res.statusText}`);
      return [];
    }

    const rawProducts = await res.json();
    if (!Array.isArray(rawProducts)) {
      return [];
    }

    return rawProducts.map(normalizeProduct);
  } catch (err) {
    console.error("Failed to fetch products from WooCommerce:", err);
    return [];
  }
}

/**
 * Fetch single product by slug from WooCommerce REST API
 */
export async function getProductBySlug(slug: string): Promise<WooCommerceProduct | null> {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return null;
    }

    const res = await fetch(
      `${getBaseUrl()}/wp-json/wc/v3/products?slug=${encodeURIComponent(slug)}`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) {
      return null;
    }

    const raw = await res.json();
    if (Array.isArray(raw) && raw.length > 0) {
      return normalizeProduct(raw[0]);
    }

    return null;
  } catch (err) {
    console.error(`Failed to fetch product by slug "${slug}":`, err);
    return null;
  }
}

/**
 * Fetch categories from WooCommerce REST API
 */
export async function getCategories(): Promise<WooCommerceCategory[]> {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return [];
    }

    const res = await fetch(
      `${getBaseUrl()}/wp-json/wc/v3/products/categories?per_page=100&hide_empty=false`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      throw new Error(`Categories API returned ${res.status}`);
    }

    const raw = await res.json();
    if (!Array.isArray(raw)) return [];

    return raw
      .filter((cat: any) => cat.slug !== "uncategorized")
      .map((cat: any) => ({
        id: cat.id,
        name: decodeHtml(cat.name || ""),
        slug: cat.slug || "",
        image: cat.image
          ? {
              id: cat.image.id,
              src: cat.image.src,
              name: cat.image.name || cat.name,
              alt: cat.image.alt || cat.name,
            }
          : null,
        count: cat.count || 0,
      }));
  } catch (err) {
    console.error("Failed to fetch categories from WooCommerce:", err);
    return [];
  }
}
