import { Metadata } from "next";
import CartView from "@/components/CartView";
import { getProducts } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Shopping Cart | luxuryladies - Premium Contemporary Fashion",
  description:
    "Review your luxury heels, designer bags, and premium sleepwear. Free delivery nationwide on orders over Tk 3,000.",
};

export default function CartPage() {
  return <CartView />;
}
