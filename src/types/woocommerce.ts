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
