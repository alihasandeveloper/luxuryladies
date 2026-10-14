import { Metadata } from "next";
import CheckoutView from "@/components/CheckoutView";
import {
  getPaymentGateways,
  getShippingMethods,
  getCountryStates,
} from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Checkout | luxuryladies - Complete Your Luxury Order",
  description:
    "Secure checkout for your luxury contemporary footwear, designer handbags, and curated sleepwear. Cash on delivery & express nationwide shipping available.",
};

export const revalidate = 60;

export default async function CheckoutPage() {
  const [paymentGateways, shippingMethods, states] = await Promise.all([
    getPaymentGateways(),
    getShippingMethods(),
    getCountryStates("BD"),
  ]);

  return (
    <CheckoutView
      initialGateways={paymentGateways}
      initialShippingMethods={shippingMethods}
      initialStates={states}
    />
  );
}


