export interface UserAddress {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar_url?: string;
  roles?: string[];
  billing?: UserAddress;
  shipping?: UserAddress;
}

export interface CustomerOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id?: number;
  quantity: number;
  subtotal: string;
  total: string;
  image?: string | null;
}

export interface CustomerOrder {
  id: number;
  order_number: string;
  status: string;
  date_created: string;
  total: string;
  formatted_total: string;
  currency: string;
  item_count: number;
  payment_method?: string;
  items: CustomerOrderLineItem[];
  billing?: UserAddress;
  shipping?: UserAddress;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  error?: string;
}
