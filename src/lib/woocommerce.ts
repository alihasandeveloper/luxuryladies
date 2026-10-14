import {
  WooCommerceCategory,
  WooCommerceProduct,
  WooCommerceImage,
  WooCommerceVariation,
  WooCommerceAttribute,
  CreateOrderPayload,
  WooCommerceOrderResponse,
  WooCommercePaymentGateway,
  WooCommerceShippingMethod,
  WooCommerceState,
} from "@/types/woocommerce";

const WP_URL = process.env.WP_BACKEND_URL || "https://headless.local";
const WP_CK = process.env.WP_CK || "";
const WP_CS = process.env.WP_CS || "";

// Allow self-signed certificates for local WordPress installations (e.g. headless.local or localhost)
if (process.env.NODE_ENV !== "production" || WP_URL.includes(".local") || WP_URL.includes("localhost")) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

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
  const rawSale = raw.sale_price || "";
  const hasSalePrice = Boolean(
    rawSale &&
    rawSale.trim() !== "" &&
    regularPrice &&
    regularPrice.trim() !== "" &&
    Number(regularPrice) > Number(rawSale) &&
    Number(rawSale) > 0
  );
  const salePrice = hasSalePrice ? String(rawSale) : "";
  const price = raw.price || (hasSalePrice ? salePrice : regularPrice);

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
    sale_price: salePrice,
    on_sale: Boolean(hasSalePrice || (raw.on_sale && hasSalePrice)),
    purchasable: raw.purchasable ?? true,
    total_sales: raw.total_sales || 0,
    stock_status: (raw.stock_status as any) || "instock",
    categories,
    images,
    attributes: (raw.attributes || []).map((attr: any) => ({
      id: attr.id,
      name: decodeHtml(attr.name || ""),
      slug: attr.slug || "",
      position: attr.position ?? 0,
      visible: Boolean(attr.visible),
      variation: Boolean(attr.variation),
      options: (attr.options || []).map((opt: any) => decodeHtml(String(opt).trim())),
    })),
    default_attributes: (raw.default_attributes || []).map((def: any) => ({
      id: def.id,
      name: decodeHtml(def.name || ""),
      option: decodeHtml(String(def.option || "").trim()),
    })),
    variations: raw.variations || [],
    variations_data: raw.variations_data || [],
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
 * Fetch variations for a variable product from WooCommerce REST API
 */
export async function getProductVariations(productId: number): Promise<WooCommerceVariation[]> {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) return [];

    const res = await fetch(
      `${getBaseUrl()}/wp-json/wc/v3/products/${productId}/variations?per_page=100`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(`WooCommerce API error fetching variations for product ${productId}: ${res.status}`);
      return [];
    }

    const rawVars = await res.json();
    if (!Array.isArray(rawVars)) return [];

    return rawVars.map((v: any) => {
      // In WooCommerce REST API, stock_status is the authoritative stock field
      const isOutOfStock =
        v.stock_status === "outofstock" ||
        (Boolean(v.manage_stock) &&
          v.stock_quantity !== null &&
          v.stock_quantity !== undefined &&
          Number(v.stock_quantity) <= 0 &&
          !v.backorders_allowed);

      const rawReg = v.regular_price || v.price || "0";
      const rawSale = v.sale_price || "";
      const hasSalePrice = Boolean(
        rawSale &&
        rawSale.trim() !== "" &&
        rawReg &&
        rawReg.trim() !== "" &&
        Number(rawReg) > Number(rawSale) &&
        Number(rawSale) > 0
      );
      const rawPrice = hasSalePrice ? rawSale : (v.price || rawReg);

      return {
        id: v.id,
        sku: v.sku || "",
        price: String(rawPrice),
        regular_price: String(rawReg),
        sale_price: hasSalePrice ? String(rawSale) : "",
        on_sale: hasSalePrice,
        purchasable: isOutOfStock ? false : Boolean(v.purchasable ?? true),
        stock_status: isOutOfStock
          ? "outofstock"
          : ((v.stock_status as any) || "instock"),
        attributes: (v.attributes || []).map((a: any) => ({
          id: a.id ?? 0,
          name: decodeHtml(a.name || ""),
          option: decodeHtml(String(a.option || "").trim()),
          slug: a.slug ? decodeHtml(String(a.slug).trim()) : undefined,
        })),
        image:
          v.image && v.image.src
            ? {
              id: v.image.id || 0,
              src: v.image.src,
              name: v.image.name || "Variation Image",
              alt: v.image.alt || "Variation Image",
            }
            : null,
      };
    });
  } catch (err) {
    console.error(`Failed to fetch variations for product ${productId}:`, err);
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
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const raw = await res.json();
    if (Array.isArray(raw) && raw.length > 0) {
      const product = normalizeProduct(raw[0]);
      if (
        (product.type === "variable" ||
          (product.variations && product.variations.length > 0)) &&
        product.id
      ) {
        product.variations_data = await getProductVariations(product.id);
      }
      return product;
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

/**
 * Create an order in WooCommerce via REST API
 */
export async function createWooCommerceOrder(
  orderPayload: CreateOrderPayload
): Promise<WooCommerceOrderResponse> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    throw new Error("WooCommerce API keys are not configured");
  }

  const res = await fetch(`${getBaseUrl()}/wp-json/wc/v3/orders`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    let parsedMessage = `WooCommerce responded with status ${res.status}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.message) {
        parsedMessage = parsed.message;
      }
    } catch {
      // ignore
    }
    throw new Error(parsedMessage);
  }

  const orderData = await res.json();
  return orderData as WooCommerceOrderResponse;
}

/**
 * Fetch available and enabled payment gateways from WooCommerce REST API
 */
export async function getPaymentGateways(): Promise<WooCommercePaymentGateway[]> {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return getDefaultPaymentGateways();
    }

    const res = await fetch(`${getBaseUrl()}/wp-json/wc/v3/payment_gateways`, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.warn(`WooCommerce payment_gateways returned ${res.status}, using default gateways`);
      return getDefaultPaymentGateways();
    }

    const raw = await res.json();
    if (!Array.isArray(raw)) {
      return getDefaultPaymentGateways();
    }

    // Only return enabled gateways
    const enabledGateways = raw
      .filter((gateway: any) => gateway.enabled === true || gateway.enabled === "yes")
      .map((g: any) => ({
        id: g.id,
        title: decodeHtml(g.title || g.method_title || "Payment"),
        description: decodeHtml(g.description || g.method_description || ""),
        order: typeof g.order === "number" ? g.order : 0,
        enabled: true,
        method_title: decodeHtml(g.method_title || g.title || ""),
        method_description: decodeHtml(g.method_description || ""),
        instructions: g.settings?.instructions?.value ? decodeHtml(g.settings.instructions.value) : undefined,
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (enabledGateways.length === 0) {
      return getDefaultPaymentGateways();
    }

    return enabledGateways;
  } catch (err) {
    console.error("Failed to fetch payment gateways from WooCommerce:", err);
    return getDefaultPaymentGateways();
  }
}

function getDefaultPaymentGateways(): WooCommercePaymentGateway[] {
  return [
    {
      id: "cod",
      title: "Cash on delivery",
      description: "Pay with cash upon delivery.",
      enabled: true,
      order: 1,
    },
    {
      id: "bacs",
      title: "Direct bank transfer",
      description: "Make your payment directly into our bank account. Please use your Order ID as the payment reference.",
      enabled: true,
      order: 2,
    },
  ];
}

/**
 * Fetch configured shipping zones and methods from WooCommerce REST API
 */
export async function getShippingMethods(): Promise<WooCommerceShippingMethod[]> {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return getDefaultShippingMethods();
    }

    const zonesRes = await fetch(`${getBaseUrl()}/wp-json/wc/v3/shipping/zones`, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 },
    });

    const shippingMethods: WooCommerceShippingMethod[] = [];

    if (zonesRes.ok) {
      const zones = await zonesRes.json();
      if (Array.isArray(zones)) {
        for (const zone of zones) {
          try {
            const mRes = await fetch(
              `${getBaseUrl()}/wp-json/wc/v3/shipping/zones/${zone.id}/methods`,
              {
                headers: {
                  Authorization: authHeader,
                  "Content-Type": "application/json",
                },
                next: { revalidate: 30 },
              }
            );
            if (mRes.ok) {
              const methods = await mRes.json();
              if (Array.isArray(methods)) {
                for (const m of methods) {
                  if (m.enabled === true || m.enabled === "yes") {
                    const rawCost = m.settings?.cost?.value ?? m.cost ?? "0";
                    const costNum = parseFloat(String(rawCost).replace(/[^0-9.]/g, "")) || 0;
                    const methodTitle =
                      m.settings?.title?.value || m.title || m.method_title || "Shipping";

                    shippingMethods.push({
                      id: `${m.method_id || "method"}:${m.instance_id || m.id}`,
                      instance_id: m.instance_id || m.id,
                      zone_id: zone.id,
                      zone_name: decodeHtml(zone.name || "Standard Delivery"),
                      method_id: m.method_id || "flat_rate",
                      method_title: decodeHtml(m.method_title || ""),
                      title: decodeHtml(methodTitle),
                      cost: costNum,
                      enabled: true,
                      min_amount: m.settings?.min_amount?.value
                        ? parseFloat(m.settings.min_amount.value)
                        : undefined,
                      requires: m.settings?.requires?.value || undefined,
                      description: decodeHtml(m.method_description || ""),
                    });
                  }
                }
              }
            }
          } catch (e) {
            console.warn(`Failed to fetch methods for zone ${zone.id}:`, e);
          }
        }
      }
    }

    // Also fetch zone 0 (locations not covered by other zones)
    try {
      const zone0Res = await fetch(
        `${getBaseUrl()}/wp-json/wc/v3/shipping/zones/0/methods`,
        {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          next: { revalidate: 30 },
        }
      );
      if (zone0Res.ok) {
        const methods0 = await zone0Res.json();
        if (Array.isArray(methods0)) {
          for (const m of methods0) {
            if (m.enabled === true || m.enabled === "yes") {
              const rawCost = m.settings?.cost?.value ?? m.cost ?? "0";
              const costNum = parseFloat(String(rawCost).replace(/[^0-9.]/g, "")) || 0;
              const methodTitle =
                m.settings?.title?.value || m.title || m.method_title || "Shipping";

              shippingMethods.push({
                id: `${m.method_id || "method"}:${m.instance_id || m.id}`,
                instance_id: m.instance_id || m.id,
                zone_id: 0,
                zone_name: "Default Location",
                method_id: m.method_id || "flat_rate",
                method_title: decodeHtml(m.method_title || ""),
                title: decodeHtml(methodTitle),
                cost: costNum,
                enabled: true,
                min_amount: m.settings?.min_amount?.value
                  ? parseFloat(m.settings.min_amount.value)
                  : undefined,
                requires: m.settings?.requires?.value || undefined,
                description: decodeHtml(m.method_description || ""),
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch zone 0 Shipping options:", e);
    }

    if (shippingMethods.length === 0) {
      return getDefaultShippingMethods();
    }

    return shippingMethods;
  } catch (err) {
    console.error("Failed to fetch Shipping options from WooCommerce:", err);
    return getDefaultShippingMethods();
  }
}

function getDefaultShippingMethods(): WooCommerceShippingMethod[] {
  return [
    {
      id: "flat_rate:1",
      instance_id: 1,
      zone_id: 1,
      zone_name: "Inside Dhaka",
      method_id: "flat_rate",
      method_title: "Flat rate",
      title: "Inside Dhaka Delivery",
      cost: 60,
      enabled: true,
    },
    {
      id: "flat_rate:2",
      instance_id: 2,
      zone_id: 2,
      zone_name: "Outside Dhaka",
      method_id: "flat_rate",
      method_title: "Flat rate",
      title: "Outside Dhaka Delivery",
      cost: 120,
      enabled: true,
    },
  ];
}

/**
 * Fetch country states / districts from WooCommerce REST API
 */
export async function getCountryStates(
  countryCode: string = "BD"
): Promise<WooCommerceState[]> {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return getDefaultBangladeshStates();
    }

    const res = await fetch(
      `${getBaseUrl()}/wp-json/wc/v3/data/countries/${encodeURIComponent(countryCode)}`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return getDefaultBangladeshStates();
    }

    const data = await res.json();
    if (Array.isArray(data?.states) && data.states.length > 0) {
      return data.states.map((s: any) => ({
        code: s.code || s.name,
        name: decodeHtml(s.name || s.code),
      }));
    }

    return getDefaultBangladeshStates();
  } catch (err) {
    console.error(`Failed to fetch states for country ${countryCode}:`, err);
    return getDefaultBangladeshStates();
  }
}

function getDefaultBangladeshStates(): WooCommerceState[] {
  return [
    { code: "BD-13", name: "Dhaka" },
    { code: "BD-10", name: "Chattogram" },
    { code: "BD-18", name: "Gazipur" },
    { code: "BD-40", name: "Narayanganj" },
    { code: "BD-60", name: "Sylhet" },
    { code: "BD-54", name: "Rajshahi" },
    { code: "BD-27", name: "Khulna" },
    { code: "BD-06", name: "Barishal" },
    { code: "BD-55", name: "Rangpur" },
    { code: "BD-39", name: "Mymensingh" },
    { code: "BD-08", name: "Cumilla" },
    { code: "BD-03", name: "Bogura" },
    { code: "BD-11", name: "Cox's Bazar" },
    { code: "BD-23", name: "Jessore" },
    { code: "BD-04", name: "Brahmanbaria" },
    { code: "BD-14", name: "Dinajpur" },
    { code: "BD-63", name: "Tangail" },
    { code: "BD-17", name: "Faridpur" },
    { code: "BD-49", name: "Pabna" },
    { code: "BD-42", name: "Narsingdi" },
    { code: "BD-47", name: "Noakhali" },
    { code: "BD-16", name: "Feni" },
    { code: "BD-30", name: "Kushtia" },
  ];
}



