import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Luxury Ladies",
  description:
    "Review the terms and conditions that govern your use of the Luxury Ladies website and your purchases.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="w-full bg-white py-12 md:py-20 px-4">
      <article className="max-w-3xl mx-auto text-dark">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-dark mb-4">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-description mb-8">
          Last updated: October 2026
        </p>

        <div className="space-y-4 text-sm md:text-base text-description leading-relaxed">
          <p>
            Welcome to <strong className="text-dark font-semibold">Luxury Ladies</strong>. By accessing or using our website (www.luxuryladies.com) and placing orders, you agree to be bound by these Terms &amp; Conditions. Please read them carefully before making any purchase.
          </p>
        </div>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            1. Account Registration
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            When you create an account on Luxury Ladies, you are responsible for maintaining the confidentiality of your account credentials and password. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            2. Product Information &amp; Pricing
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            We strive to display our products, including luxury heels, bags, and apparel, with maximum visual and descriptive accuracy. However, slight color variations may occur depending on your screen settings and lighting.
          </p>
          <p className="text-sm md:text-base text-description leading-relaxed">
            All prices listed on the website are in Bangladeshi Taka (BDT) and are subject to change without prior notice. In the event of a pricing error, Luxury Ladies reserves the right to cancel any orders placed at the incorrect price.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            3. Orders &amp; Cancellations
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            Placing an order constitutes an offer to purchase. Luxury Ladies reserves the right to accept or decline your order at any time after receipt for reasons including product availability, suspicion of fraud, or incomplete shipping details.
          </p>
          <p className="text-sm md:text-base text-description leading-relaxed">
            If you wish to cancel an order, you must do so before the order is dispatched by contacting our support team with your Order ID. Once an item has been handed over to the courier, standard return and exchange procedures apply.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            4. Payments &amp; Delivery
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            We accept Cash on Delivery (COD) as well as secure online payments via bKash, Nagad, and credit/debit cards. Delivery timelines and charges are governed by our{" "}
            <Link href="/shipping-policy" className="text-primary hover:underline font-medium">
              Delivery &amp; Shipping Policy
            </Link>
            .
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            5. Intellectual Property
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            All content on this website, including logos, images, graphics, designs, and text, is the property of Luxury Ladies and is protected by copyright and intellectual property laws. Unauthorized reproduction or use is strictly prohibited.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 pt-2">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            6. Governing Law
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            These Terms &amp; Conditions are governed by and construed in accordance with the laws of Bangladesh. Any disputes arising from transactions on this site shall be subject to the exclusive jurisdiction of the courts of Bangladesh.
          </p>
          <div className="text-sm md:text-base text-description pt-4 space-y-1">
            <p>
              Questions? Email us at{" "}
              <a href="mailto:support@luxuryladies.com" className="text-primary hover:underline font-medium">
                support@luxuryladies.com
              </a>
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
