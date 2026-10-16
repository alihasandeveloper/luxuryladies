export interface WishlistItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  regularPrice?: number;
  image: string;
  stockStatus?: string;
  type?: string;
}
