import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support Center | Luxury Ladies",
  description:
    "Find answers to frequently asked questions, order assistance, and customer support contact details for Luxury Ladies.",
};

export default function SupportCenterPage() {
  return (
    <div className="w-full bg-white py-12 md:py-20 px-4">
      <article className="max-w-3xl mx-auto text-dark">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-dark mb-4">
          Support Center
        </h1>
        <p className="text-sm md:text-base text-description mb-8 leading-relaxed">
          Welcome to the Luxury Ladies Support Center. We are here to assist you with your orders, sizing queries, deliveries, and more.
        </p>

        {/* Contact Information */}
        <div className="p-6 border border-border bg-slate-50/50 mb-10 space-y-2">
          <h2 className="text-base font-bold text-dark uppercase tracking-wider mb-3">
            Direct Customer Support
          </h2>
          <p className="text-sm text-description">
            <strong className="text-dark">Hotline / WhatsApp:</strong>{" "}
            <a href="tel:+8801540010960" className="text-primary hover:underline font-medium">
              +8801540010960
            </a>
          </p>
          <p className="text-sm text-description">
            <strong className="text-dark">Email:</strong>{" "}
            <a href="mailto:support@luxuryladies.com" className="text-primary hover:underline font-medium">
              support@luxuryladies.com
            </a>
          </p>
          <p className="text-sm text-description">
            <strong className="text-dark">Support Hours:</strong> Saturday – Thursday, 10:00 AM – 8:00 PM
          </p>
          <p className="text-sm text-description">
            <strong className="text-dark">Office Address:</strong> Dottobari, Bogura, Bangladesh
          </p>
        </div>

        <hr className="my-8 md:my-10 border-border" />

        {/* Frequently Asked Questions */}
        <section className="space-y-6 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            Frequently Asked Questions (FAQ)
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1.5">
                How do I place an order?
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                Browse our collections, select your desired size or color, and click <strong>Add to Cart</strong> or <strong>Buy Now</strong>. Proceed to the checkout page, enter your delivery address and phone number, and select your preferred payment method (Cash on Delivery or Online Payment) to complete your order.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1.5">
                How can I track my order?
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                You can track your order status in real time anytime using our{" "}
                <Link href="/track-order" className="text-primary hover:underline font-medium">
                  Track Your Order
                </Link>{" "}
                page by entering your numeric Order ID.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1.5">
                How long does delivery take?
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                Orders inside Dhaka are typically delivered within 24 to 48 hours. Orders outside Dhaka take 2 to 4 business days. For full details, see our{" "}
                <Link href="/shipping-policy" className="text-primary hover:underline font-medium">
                  Delivery &amp; Shipping Policy
                </Link>
                .
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1.5">
                Can I exchange if the shoe size doesn&apos;t fit?
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                Yes! We offer a friendly size exchange policy within 3 days of delivery, provided the footwear is unworn and in original condition. See our{" "}
                <Link href="/returns-exchange" className="text-primary hover:underline font-medium">
                  Return &amp; Exchange Policy
                </Link>{" "}
                for simple step-by-step instructions.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1.5">
                What payment methods do you accept?
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                We accept Cash on Delivery (COD) across all districts in Bangladesh, as well as bKash, Nagad, Rocket, Visa, and Mastercard via our secure checkout.
              </p>
            </div>
          </div>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        {/* Quick Links */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            Helpful Links
          </h2>
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/track-order" className="text-primary hover:underline">
              Track Your Order &rarr;
            </Link>
            <Link href="/shipping-policy" className="text-primary hover:underline">
              Shipping Policy &rarr;
            </Link>
            <Link href="/returns-exchange" className="text-primary hover:underline">
              Return &amp; Exchange &rarr;
            </Link>
            <Link href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy &rarr;
            </Link>
            <Link href="/terms-and-conditions" className="text-primary hover:underline">
              Terms &amp; Conditions &rarr;
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
