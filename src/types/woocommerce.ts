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
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  type?: string;
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
  attributes?: {
    id: number;
    name: string;
    options: string[];
  }[];
  meta_data?: {
    key: string;
    value: string;
  }[];
}
