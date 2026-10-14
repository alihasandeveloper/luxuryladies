import { Metadata } from "next";
import CartView from "@/components/CartView";
import { getProducts } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Shopping Cart | luxuryladies - Premium Contemporary Fashion",
  description:
    "Review your luxury heels, designer bags, and premium sleepwear.",
};

export default function CartPage() {
  return <CartView />;
}
