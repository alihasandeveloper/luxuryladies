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
  GeneralSettingsData,
} from "@/types/woocommerce";
import demoData from "@/data/demo-data.json";

export const isDemoMode = (): boolean => {
  return (
    process.env.ENABLE_DEMO === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_DEMO === "true"
  );
};

const WP_URL = (process.env.WP_BACKEND_URL || "").trim().replace(/\/+$/, "");
const WP_CK = process.env.WP_CK || "";
const WP_CS = process.env.WP_CS || "";

// Allow self-signed certificates for local WordPress installations
if (process.env.NODE_ENV !== "production" || WP_URL.includes(".local") || WP_URL.includes("localhost")) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

function getAuthHeader(): string {
  if (!WP_CK || !WP_CS) return "";
  return "Basic " + Buffer.from(`${WP_CK}:${WP_CS}`).toString("base64");
}

function getBaseUrl(): string {
  return (process.env.WP_BACKEND_URL || "").trim().replace(/\/+$/, "");
}

export const DEFAULT_PRODUCT_PLACEHOLDER = "/woocommerce-placeholder.webp";

export function decodeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
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
    offers: (() => {
      if (Array.isArray(raw.offers) && raw.offers.length > 0) {
        return raw.offers.map((o: any) =>
          typeof o === "object"
            ? { id: o.id, name: decodeHtml(o.name || ""), slug: o.slug || "", count: o.count }
            : { id: Number(o), name: String(o), slug: String(o) }
        );
      }
      const metaOffers = raw.meta_data?.find((m: any) => m && (m.key === "offers" || m.key === "_offers"));
      if (metaOffers && metaOffers.value) {
        const val = Array.isArray(metaOffers.value) ? metaOffers.value : [metaOffers.value];
        return val.map((o: any) =>
          typeof o === "object"
            ? { id: o.id, name: decodeHtml(o.name || ""), slug: o.slug || "" }
            : { id: Number(o), name: String(o), slug: String(o) }
        );
      }
      return [];
    })(),
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
    default_attributes: (() => {
      let rawDef: any[] = [];
      if (Array.isArray(raw.default_attributes) && raw.default_attributes.length > 0) {
        rawDef = raw.default_attributes;
      } else if (raw.default_attributes && typeof raw.default_attributes === "object") {
        rawDef = Object.entries(raw.default_attributes).map(([k, v]) => ({
          name: k,
          option: typeof v === "object" && v !== null ? (v as any).option || "" : String(v || ""),
        }));
      } else if (Array.isArray(raw.meta_data)) {
        const metaDef = raw.meta_data.find((m: any) => m && m.key === "_default_attributes");
        if (metaDef && metaDef.value) {
          if (Array.isArray(metaDef.value)) {
            rawDef = metaDef.value;
          } else if (typeof metaDef.value === "object") {
            rawDef = Object.entries(metaDef.value).map(([k, v]) => ({
              name: k,
              option: typeof v === "object" && v !== null ? (v as any).option || "" : String(v || ""),
            }));
          }
        }
      }
      return rawDef
        .map((def: any) => ({
          id: def.id ?? 0,
          name: decodeHtml(def.name || ""),
          option: decodeHtml(String(def.option || def.value || "").trim()),
        }))
        .filter((def: any) => def.name && def.option);
    })(),
    variations: raw.variations || [],
    variations_data: raw.variations_data || [],
    meta_data: raw.meta_data || [],
  };
}

/**
 * Fetch all products from WooCommerce REST API
 */
export async function getProducts(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<WooCommerceProduct[]> {
  if (isDemoMode()) {
    let prods = demoData.products as unknown as WooCommerceProduct[];
    if (params?.featured !== undefined) {
      prods = prods.filter((p) => p.featured === params.featured);
    }
    if (params?.category) {
      const catSlug = params.category.toLowerCase().trim();
      prods = prods.filter((p) =>
        p.categories?.some((c) => c.slug.toLowerCase() === catSlug)
      );
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categories?.some((c) => c.name.toLowerCase().includes(q))
      );
    }
    const page = params?.page || 1;
    const perPage = params?.per_page || 12;
    const start = (page - 1) * perPage;
    return prods.slice(start, start + perPage);
  }

  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      console.warn("WooCommerce credentials not provided.");
      return [];
    }

    const query = new URLSearchParams();
    query.set("per_page", String(params?.per_page || 12));
    if (params?.page) {
      query.set("page", String(params.page));
    }
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
      next: { revalidate: 60, tags: ["products"] },
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
  if (isDemoMode()) {
    const prod = (demoData.products as unknown as WooCommerceProduct[]).find((p) => p.id === productId);
    return (prod?.variations_data as WooCommerceVariation[]) || [];
  }

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
        stock_quantity: v.stock_quantity !== undefined && v.stock_quantity !== null ? Number(v.stock_quantity) : null,
        manage_stock: Boolean(v.manage_stock),
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
  if (isDemoMode()) {
    const clean = decodeURIComponent(slug).toLowerCase();
    const prod = (demoData.products as unknown as WooCommerceProduct[]).find(
      (p) => p.slug.toLowerCase() === clean || String(p.id) === clean
    );
    return prod || null;
  }

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
        next: { revalidate: 60, tags: ["product", `product-${slug}`] },
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
  if (isDemoMode()) {
    return demoData.categories as unknown as WooCommerceCategory[];
  }

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
        next: { revalidate: 300, tags: ["categories"] },
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
  if (isDemoMode()) {
    const demoId = 30000 + Math.floor(Math.random() * 9000);
    return {
      id: demoId,
      order_key: `wc_order_demo_${demoId}`,
      status: "processing",
      currency: "BDT",
      total: String(
        orderPayload.line_items.reduce((sum, item) => sum + 2600 * item.quantity, 0) +
          (Number(orderPayload.shipping_lines?.[0]?.total) || 80)
      ),
      billing: orderPayload.billing,
      shipping: orderPayload.shipping,
      payment_method: orderPayload.payment_method,
      payment_method_title: orderPayload.payment_method_title,
      line_items: orderPayload.line_items as any,
      date_created: new Date().toISOString(),
      customer_id: orderPayload.customer_id,
    } as WooCommerceOrderResponse;
  }

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
  if (isDemoMode()) {
    return demoData.paymentGateways as WooCommercePaymentGateway[];
  }

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
      next: { revalidate: 3600, tags: ["payment-gateways"] },
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
  ];
}

interface ZoneWithLocationsAndMethods {
  zone: { id: number; name: string };
  locations: Array<{ code: string; type: string }>;
  methods: WooCommerceShippingMethod[];
}

let cachedShippingData: {
  timestamp: number;
  zones: ZoneWithLocationsAndMethods[];
  zone0Methods: WooCommerceShippingMethod[];
} | null = null;

/**
 * Fetch configured shipping zones and methods from WooCommerce REST API,
 * dynamically filtered for the customer's selected District / State.
 */
let cachedStoreCountry: { timestamp: number; country: string } | null = null;

/**
 * Fetch the store's configured shipping country from WooCommerce general settings.
 * Checks "Ship to specific countries" (`woocommerce_specific_ship_to_countries`),
 * "Sell to specific countries" (`woocommerce_specific_allowed_countries`),
 * and store base location (`woocommerce_default_country`).
 */
export async function getStoreDefaultCountry(): Promise<string> {
  if (isDemoMode()) {
    return "BD";
  }

  const now = Date.now();
  if (cachedStoreCountry && now - cachedStoreCountry.timestamp < 60000) {
    return cachedStoreCountry.country;
  }

  const authHeader = getAuthHeader();
  if (!authHeader) return "BD";

  try {
    const res = await fetch(`${getBaseUrl()}/wp-json/wc/v3/settings/general`, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 86400, tags: ["countries"] },
    });

    if (res.ok) {
      const settings = await res.json();
      if (Array.isArray(settings)) {
        // 1. "Ship to specific countries"
        const shipTo = settings.find((s) => s.id === "woocommerce_ship_to_countries");
        const specificShip = settings.find((s) => s.id === "woocommerce_specific_ship_to_countries");
        if (
          shipTo?.value === "specific" &&
          Array.isArray(specificShip?.value) &&
          specificShip.value.length > 0
        ) {
          const country = String(specificShip.value[0]).toUpperCase();
          cachedStoreCountry = { timestamp: now, country };
          return country;
        }

        // 2. "Sell to specific countries"
        const allowed = settings.find((s) => s.id === "woocommerce_allowed_countries");
        const specificAllowed = settings.find((s) => s.id === "woocommerce_specific_allowed_countries");
        if (
          allowed?.value === "specific" &&
          Array.isArray(specificAllowed?.value) &&
          specificAllowed.value.length > 0
        ) {
          const country = String(specificAllowed.value[0]).toUpperCase();
          cachedStoreCountry = { timestamp: now, country };
          return country;
        }

        // 3. Store base location (e.g. "BD" or "BD:BD-13")
        const defaultCountry = settings.find((s) => s.id === "woocommerce_default_country");
        if (defaultCountry?.value) {
          const raw = String(defaultCountry.value);
          const countryPart = raw.split(":")[0].toUpperCase();
          if (countryPart) {
            cachedStoreCountry = { timestamp: now, country: countryPart };
            return countryPart;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to fetch store country from WooCommerce settings:", err);
  }

  return "BD";
}

let cachedStatesMap = new Map<string, { timestamp: number; states: WooCommerceState[] }>();

/**
 * Fetch country states / districts dynamically from WooCommerce REST API
 * using `/wp-json/wc/v3/data/countries/{countryCode}`
 */
export async function getCountryStates(
  countryCode?: string
): Promise<WooCommerceState[]> {
  if (isDemoMode()) {
    return demoData.countryStates as WooCommerceState[];
  }

  const code = (countryCode || (await getStoreDefaultCountry())).trim().toUpperCase();
  const now = Date.now();
  const cached = cachedStatesMap.get(code);
  if (cached && now - cached.timestamp < 60000) {
    return cached.states;
  }

  const authHeader = getAuthHeader();
  if (!authHeader) {
    return [];
  }

  try {
    const res = await fetch(
      `${getBaseUrl()}/wp-json/wc/v3/data/countries/${encodeURIComponent(code)}`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        next: { revalidate: 86400, tags: ["countries"] },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.states)) {
        const states: WooCommerceState[] = data.states.map((s: any) => ({
          code: s.code || s.name,
          name: decodeHtml(s.name || s.code),
        }));
        cachedStatesMap.set(code, { timestamp: now, states });
        return states;
      }
    }
  } catch (err) {
    console.error(`Failed to fetch states for country ${code}:`, err);
  }

  return [];
}

/**
 * Fetch configured shipping zones and methods from WooCommerce REST API,
 * dynamically matched against the customer's district and country.
 */
export async function getShippingMethods(
  district?: string,
  countryCode?: string
): Promise<WooCommerceShippingMethod[]> {
  if (isDemoMode()) {
    if (!district || !district.trim()) return [];
    const isDhaka = district.trim().toLowerCase().includes("dhaka");
    if (isDhaka) {
      return [demoData.shippingMethods[0] as WooCommerceShippingMethod];
    }
    return [demoData.shippingMethods[1] as WooCommerceShippingMethod];
  }

  if (!district || !district.trim()) {
    return [];
  }

  const authHeader = getAuthHeader();
  if (!authHeader) {
    return [];
  }

  try {
    const now = Date.now();
    let shippingData = cachedShippingData;

    // Fetch and cache WooCommerce shipping zones, locations, and methods for 30s
    if (!shippingData || now - shippingData.timestamp > 30000) {
      const zonesRes = await fetch(`${getBaseUrl()}/wp-json/wc/v3/shipping/zones`, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const zonesWithData: ZoneWithLocationsAndMethods[] = [];
      let zone0Methods: WooCommerceShippingMethod[] = [];

      if (zonesRes.ok) {
        const zones = await zonesRes.json();
        if (Array.isArray(zones)) {
          for (const zone of zones) {
            try {
              const [locRes, mRes] = await Promise.all([
                fetch(`${getBaseUrl()}/wp-json/wc/v3/shipping/zones/${zone.id}/locations`, {
                  headers: { Authorization: authHeader, "Content-Type": "application/json" },
                  cache: "no-store",
                }),
                fetch(`${getBaseUrl()}/wp-json/wc/v3/shipping/zones/${zone.id}/methods`, {
                  headers: { Authorization: authHeader, "Content-Type": "application/json" },
                  cache: "no-store",
                }),
              ]);

              const locations = locRes.ok ? await locRes.json() : [];
              const rawMethods = mRes.ok ? await mRes.json() : [];

              const methods: WooCommerceShippingMethod[] = [];
              if (Array.isArray(rawMethods)) {
                for (const m of rawMethods) {
                  if (m.enabled === true || m.enabled === "yes") {
                    const rawCost = m.settings?.cost?.value ?? m.cost ?? "0";
                    const costNum = parseFloat(String(rawCost).replace(/[^0-9.]/g, "")) || 0;
                    const methodTitle =
                      m.settings?.title?.value || m.title || m.method_title || "Shipping";

                    methods.push({
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

              zonesWithData.push({
                zone: { id: zone.id, name: zone.name || "" },
                locations: Array.isArray(locations) ? locations : [],
                methods,
              });
            } catch (e) {
              console.warn(`Failed to fetch methods for zone ${zone.id}:`, e);
            }
          }
        }
      }

      // Fetch Zone 0 (Locations not covered by other zones)
      try {
        const zone0Res = await fetch(
          `${getBaseUrl()}/wp-json/wc/v3/shipping/zones/0/methods`,
          {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            cache: "no-store",
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

                zone0Methods.push({
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

      shippingData = {
        timestamp: now,
        zones: zonesWithData,
        zone0Methods,
      };
      cachedShippingData = shippingData;
    }

    const country = (countryCode || (await getStoreDefaultCountry())).trim().toUpperCase();
    const states = await getCountryStates(country);

    const target = district.trim().toLowerCase();
    const matchedState = states.find(
      (s) =>
        s.name.toLowerCase() === target ||
        s.code.toLowerCase() === target ||
        s.code.toLowerCase().replace(`${country.toLowerCase()}-`, "") === target
    );

    const stateCode = matchedState ? matchedState.code.toLowerCase() : "";
    const stateNum = stateCode.replace(`${country.toLowerCase()}-`, "");
    const stateName = matchedState ? matchedState.name.toLowerCase() : target;

    // 1. Loop through configured WooCommerce shipping zones
    for (const z of shippingData.zones) {
      if (z.methods.length === 0) continue;

      const stateLocations = z.locations.filter((loc) => loc.type === "state");
      const countryLocations = z.locations.filter((loc) => loc.type === "country");

      // Check 1: If zone has specific state locations, strictly match against customer's district/state
      if (stateLocations.length > 0) {
        const hasStateMatch = stateLocations.some((loc) => {
          const locCode = (loc.code || "").trim().toLowerCase();
          return (
            (stateCode && (
              locCode === `${country.toLowerCase()}:${stateCode}` ||
              locCode === stateCode ||
              locCode === `${country.toLowerCase()}:${stateNum}` ||
              locCode === stateNum
            )) ||
            (stateName && (
              locCode === `${country.toLowerCase()}:${stateName}` ||
              locCode === stateName
            )) ||
            locCode === target ||
            locCode === `${country.toLowerCase()}:${target}`
          );
        });

        if (hasStateMatch) {
          return z.methods;
        }
        // If state locations are defined and this district is not in them, this zone does not cover it
        continue;
      }

      // Check 2: If zone has country location with no state restrictions, it covers the entire country
      const isCountryWide = countryLocations.some(
        (loc) => (loc.code || "").trim().toUpperCase() === country
      );
      if (isCountryWide) {
        return z.methods;
      }

      // Check 3: Check if zone name is explicitly named after this specific district
      const zoneName = z.zone.name.trim().toLowerCase();
      if (zoneName === target || (stateName && zoneName === stateName)) {
        return z.methods;
      }
    }

    // 2. Fallback to Zone 0 ("Locations not covered by other zones") if enabled
    if (shippingData.zone0Methods.length > 0) {
      return shippingData.zone0Methods;
    }

    // 3. If WooCommerce zones exist and none cover this district, return empty (no shipping available)
    return [];
  } catch (err) {
    console.error("Failed to fetch Shipping options from WooCommerce:", err);
    return [];
  }
}

export interface WooCommerceCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: string;
  description?: string;
  date_expires?: string | null;
  date_expires_gmt?: string | null;
  usage_count: number;
  individual_use?: boolean;
  product_ids?: number[];
  excluded_product_ids?: number[];
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  free_shipping?: boolean;
  minimum_amount?: string;
  maximum_amount?: string;
}

export async function verifyWooCommerceCoupon(
  code: string,
  subtotal: number = 0
): Promise<{
  success: boolean;
  message: string;
  coupon?: {
    code: string;
    discountPercent?: number;
    discountAmount?: number;
    freeShipping?: boolean;
    minSpend?: number;
    maxSpend?: number;
  };
}> {
  const cleanCode = code.trim();
  if (!cleanCode) {
    return { success: false, message: "Please enter a coupon code." };
  }

  if (isDemoMode()) {
    const upper = cleanCode.toUpperCase();
    const found = demoData.coupons.find((c) => c.code.toUpperCase() === upper);
    if (!found) {
      return { success: false, message: `Coupon code "${code}" is invalid or expired.` };
    }
    if (subtotal < found.minSpend) {
      return { success: false, message: `Minimum spend of Tk ${found.minSpend} required for this coupon.` };
    }
    return {
      success: true,
      message: "Coupon applied successfully!",
      coupon: found,
    };
  }

  const authHeader = getAuthHeader();
  if (authHeader) {
    try {
      let url = `${getBaseUrl()}/wp-json/wc/v3/coupons?code=${encodeURIComponent(cleanCode)}`;
      let res = await fetch(url, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      let coupons: WooCommerceCoupon[] = res.ok ? await res.json() : [];

      // If not found with the raw casing, try lowercase
      if ((!Array.isArray(coupons) || coupons.length === 0) && cleanCode.toLowerCase() !== cleanCode) {
        const lowerUrl = `${getBaseUrl()}/wp-json/wc/v3/coupons?code=${encodeURIComponent(cleanCode.toLowerCase())}`;
        const lowerRes = await fetch(lowerUrl, {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        if (lowerRes.ok) {
          coupons = await lowerRes.json();
        }
      }

      if (Array.isArray(coupons) && coupons.length > 0) {
        const match = coupons.find(
          (c) => c.code.toLowerCase() === cleanCode.toLowerCase()
        );

        if (match) {
          // Check expiration
          const exp = match.date_expires_gmt || match.date_expires;
          if (exp) {
            const expTime = new Date(exp).getTime();
            if (!isNaN(expTime) && expTime < Date.now()) {
              return { success: false, message: "This coupon code has expired." };
            }
          }

          // Check usage limit
          if (match.usage_limit && match.usage_count >= match.usage_limit) {
            return {
              success: false,
              message: "Coupon usage limit has been reached.",
            };
          }

          // Check min spend
          const minAmount = parseFloat(match.minimum_amount || "0");
          if (minAmount > 0 && subtotal > 0 && subtotal < minAmount) {
            return {
              success: false,
              message: `Coupon "${match.code.toUpperCase()}" requires a minimum order of Tk ${minAmount.toLocaleString()}.`,
            };
          }

          // Check max spend
          const maxAmount = parseFloat(match.maximum_amount || "0");
          if (maxAmount > 0 && subtotal > 0 && subtotal > maxAmount) {
            return {
              success: false,
              message: `Coupon "${match.code.toUpperCase()}" is only valid for orders up to Tk ${maxAmount.toLocaleString()}.`,
            };
          }

          const parsedAmount = parseFloat(match.amount || "0");
          const isPercent = match.discount_type === "percent";
          const isFixed =
            match.discount_type === "fixed_cart" ||
            match.discount_type === "fixed_product" ||
            !isPercent;

          let discountPercent: number | undefined;
          let discountAmount: number | undefined;
          let successMessage = `Coupon "${match.code.toUpperCase()}" applied!`;

          if (isPercent && parsedAmount > 0) {
            discountPercent = parsedAmount;
            successMessage = `Coupon applied! ${parsedAmount}% discount added.`;
          } else if (isFixed && parsedAmount > 0) {
            discountAmount = parsedAmount;
            successMessage = `Coupon applied! Tk ${parsedAmount.toFixed(0)} discount added.`;
          } else if (match.free_shipping) {
            successMessage = `Coupon applied! Free shipping added.`;
          }

          return {
            success: true,
            message: successMessage,
            coupon: {
              code: match.code.toUpperCase(),
              discountPercent,
              discountAmount,
              freeShipping: Boolean(match.free_shipping),
              minSpend: minAmount > 0 ? minAmount : undefined,
              maxSpend: maxAmount > 0 ? maxAmount : undefined,
            },
          };
        }
      }
    } catch (err: any) {
      console.warn("Failed to fetch coupon from WooCommerce:", err.message);
    }
  }

  // Fallback demo coupons if offline or testing
  const upper = cleanCode.toUpperCase();
  if (upper === "LUXURY10") {
    return {
      success: true,
      message: "Coupon applied! 10% discount added.",
      coupon: { code: "LUXURY10", discountPercent: 10 },
    };
  }
  if (upper === "WELCOME200") {
    if (subtotal < 1000) {
      return {
        success: false,
        message: "WELCOME200 requires minimum order of Tk 1,000.",
      };
    }
    return {
      success: true,
      message: "Coupon applied! Tk 200 discount added.",
      coupon: { code: "WELCOME200", discountAmount: 200, minSpend: 1000 },
    };
  }
  if (upper === "PINK15") {
    return {
      success: true,
      message: "Coupon applied! 15% discount added.",
      coupon: { code: "PINK15", discountPercent: 15 },
    };
  }

  return {
    success: false,
    message: "Invalid or expired coupon code.",
  };
}

/**
 * Fetch general settings from NextJS Helper WordPress plugin
 * (Header categories, Shop by categories, Landing page categories, Hero gallery, Information, Social links)
 */
export async function getGeneralSettings(): Promise<GeneralSettingsData | null> {
  if (isDemoMode()) {
    return demoData.generalSettings as unknown as GeneralSettingsData;
  }

  try {
    const authHeader = getAuthHeader();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const res = await fetch(`${getBaseUrl()}/wp-json/nextjs-helper/v1/general-settings`, {
      headers,
      next: { revalidate: 300, tags: ["general-settings"] },
    });

    if (!res.ok) {
      console.warn(`[getGeneralSettings] API returned ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (data && data.success && data.data) {
      const formatCat = (cat: any) => ({
        ...cat,
        name: decodeHtml(cat.name || ""),
      });

      return {
        ...data.data,
        header_categories: (data.data.header_categories || []).map(formatCat),
        shop_by_categories: (data.data.shop_by_categories || []).map(formatCat),
        featured_categories: (data.data.featured_categories || []).map(formatCat),
        landing_page_categories: (data.data.landing_page_categories || []).map(formatCat),
        landing_page_offers: (data.data.landing_page_offers || []).map(formatCat),
        landing_page_category_groups: {
          categories: (data.data.landing_page_category_groups?.categories || data.data.landing_page_categories || []).map(formatCat),
          offers: (data.data.landing_page_category_groups?.offers || data.data.landing_page_offers || []).map(formatCat),
        },
      } as GeneralSettingsData;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch general settings from WordPress:", err);
    return null;
  }
}

/**
 * Fetch offers taxonomy terms from WordPress / WooCommerce
 */
export async function getOffers(): Promise<WooCommerceCategory[]> {
  if (isDemoMode()) {
    return demoData.offers as unknown as WooCommerceCategory[];
  }

  try {
    const authHeader = getAuthHeader();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // 1. Try WP REST API endpoint for custom taxonomy 'offers'
    const res = await fetch(`${getBaseUrl()}/wp-json/wp/v2/offers?per_page=100&hide_empty=false`, {
      headers,
      next: { revalidate: 300, tags: ["offers"] },
    });

    if (res.ok) {
      const raw = await res.json();
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((o: any) => ({
          id: o.id,
          name: decodeHtml(o.name || ""),
          slug: o.slug || "",
          count: o.count || 0,
        }));
      }
    }
  } catch (err) {
    console.warn("Failed to fetch offers from /wp/v2/offers:", err);
  }

  // 2. Fallback to general settings landing_page_offers if available
  try {
    const settings = await getGeneralSettings();
    if (settings?.landing_page_offers && settings.landing_page_offers.length > 0) {
      return settings.landing_page_offers.map((o: any) => ({
        id: o.id,
        name: decodeHtml(o.name || ""),
        slug: o.slug || "",
        count: o.count || 0,
      }));
    }
  } catch (err) { }

  return [];
}
