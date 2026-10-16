export interface WooCommerceImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  image?: {
    id?: number;
    src: string;
    name?: string;
    alt?: string;
  } | null;
  count?: number;
}

export interface WooCommerceAttribute {
  id: number;
  name: string;
  slug?: string;
  position?: number;
  visible?: boolean;
  variation?: boolean;
  options: string[];
}

export interface WooCommerceDefaultAttribute {
  id: number;
  name: string;
  option: string;
}

export interface WooCommerceVariationAttribute {
  id: number;
  name: string;
  option: string;
  slug?: string;
}

export interface WooCommerceVariation {
  id: number;
  sku?: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable?: boolean;
  stock_status?: "instock" | "outofstock" | "onbackorder";
  attributes: WooCommerceVariationAttribute[];
  image?: WooCommerceImage | null;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  type?: "simple" | "variable" | "grouped" | "external" | string;
  status?: string;
  featured?: boolean;
  catalog_visibility?: string;
  description?: string;
  short_description?: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable?: boolean;
  total_sales?: number;
  stock_status?: "instock" | "outofstock" | "onbackorder";
  categories: WooCommerceCategory[];
  images: WooCommerceImage[];
  attributes?: WooCommerceAttribute[];
  default_attributes?: WooCommerceDefaultAttribute[];
  variations?: number[];
  variations_data?: WooCommerceVariation[];
  meta_data?: {
    key: string;
    value: string;
  }[];
}

export interface WooCommerceOrderBilling {
  first_name: string;
  last_name?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone: string;
}

export interface WooCommerceOrderShipping {
  first_name: string;
  last_name?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface WooCommerceOrderLineItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
  name?: string;
  subtotal?: string;
  total?: string;
  meta_data?: { key: string; value: string }[];
}

export interface CreateOrderPayload {
  status?: string;
  payment_method: string;
  payment_method_title: string;
  set_paid?: boolean;
  billing: WooCommerceOrderBilling;
  shipping: WooCommerceOrderShipping;
  line_items: WooCommerceOrderLineItem[];
  shipping_lines?: {
    method_id: string;
    method_title: string;
    total: string;
  }[];
  coupon_lines?: { code: string }[];
  customer_note?: string;
  meta_data?: { key: string; value: string }[];
}

export interface WooCommerceOrderResponse {
  id: number;
  order_key?: string;
  status: string;
  currency: string;
  total: string;
  billing: WooCommerceOrderBilling;
  shipping: WooCommerceOrderShipping;
  payment_method: string;
  payment_method_title: string;
  line_items: WooCommerceOrderLineItem[];
  date_created?: string;
}

export interface WooCommercePaymentGateway {
  id: string;
  title: string;
  description?: string;
  order?: number;
  enabled: boolean;
  method_title?: string;
  method_description?: string;
  instructions?: string;
  settings?: Record<string, any>;
}

export interface WooCommerceShippingMethod {
  id: string;
  instance_id: number;
  zone_id: number;
  zone_name: string;
  method_id: string;
  method_title: string;
  title: string;
  cost: number;
  enabled: boolean;
  min_amount?: number;
  requires?: string;
  description?: string;
}

export interface WooCommerceState {
  code: string;
  name: string;
}

export interface HeroGalleryItem {
  id: number;
  url: string;
  title?: string;
  alt?: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
  full?: string;
}

export interface PluginCategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  parent?: number;
  image?: string | null;
}

export interface ContactInformation {
  phone?: string;
  email?: string;
  address?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
}

export interface GeneralSettingsData {
  header_categories: PluginCategoryItem[];
  shop_by_categories: PluginCategoryItem[];
  featured_categories: PluginCategoryItem[];
  landing_page_categories: PluginCategoryItem[];
  hero_gallery: HeroGalleryItem[];
  information: ContactInformation;
  social_links: SocialLinks;
}



