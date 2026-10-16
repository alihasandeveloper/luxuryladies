import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return & Exchange Policy | Luxury Ladies",
  description:
    "Learn about our hassle-free return and size exchange policy for heels, bags, and fashion items at Luxury Ladies.",
};

export default function ReturnsExchangePage() {
  return (
    <div className="w-full bg-white py-12 md:py-20 px-4">
      <article className="max-w-3xl mx-auto text-dark">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-dark mb-4">
          Return &amp; Exchange Policy
        </h1>
        <p className="text-xs text-description mb-8">
          Last updated: October 2026
        </p>

        <div className="space-y-4 text-sm md:text-base text-description leading-relaxed">
          <p>
            At <strong className="text-dark font-semibold">Luxury Ladies</strong>, we want you to feel completely confident and thrilled with your purchase. If a product does not fit you or meet your expectations, we offer a simple, customer-friendly return and exchange process.
          </p>
        </div>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            1. Exchange Window &amp; Eligibility
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            You may request an exchange within <strong>3 days</strong> of receiving your parcel. To be eligible for a return or exchange:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-description leading-relaxed">
            <li>The item must be unused, unworn, unwashed, and in the same pristine condition as received.</li>
            <li>All original brand tags, labels, and protective wrapping must remain intact.</li>
            <li>Footwear (heels, flats, sandals) must be tried on clean carpeted surfaces to prevent sole scuffs.</li>
            <li>The original shoe box and packaging must be returned undamaged.</li>
          </ul>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            2. Footwear Size Exchange
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            We understand that finding the perfect shoe size online can sometimes be tricky. If your heels or sandals don&apos;t fit comfortably, we gladly exchange for an alternate size subject to stock availability.
          </p>
          <p className="text-sm md:text-base text-description leading-relaxed">
            For size exchanges, the customer covers the return courier charge, while Luxury Ladies will dispatch your replacement pair promptly.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            3. Damaged or Incorrect Items
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            In the rare event that you receive a damaged, defective, or incorrect product, please inform us within <strong>24 hours</strong> of receiving the delivery with clear photos or an unboxing video. We will replace the item immediately at zero additional delivery cost to you.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            4. How to Request an Exchange
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm md:text-base text-description leading-relaxed">
            <li>
              Contact our support team via phone/WhatsApp at <strong>+8801540010960</strong> or email <strong>support@luxuryladies.com</strong>.
            </li>
            <li>Provide your <strong>Order ID</strong> (e.g. #379) and describe the reason for exchange or size requirement.</li>
            <li>Once approved, our team will schedule a return pickup or provide courier return instructions.</li>
            <li>Your replacement item will be dispatched as soon as the returned product is inspected.</li>
          </ol>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 pt-2">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            5. Need Assistance?
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            Have questions about an ongoing return or exchange? Contact our customer support team:
          </p>
          <div className="text-sm md:text-base text-description space-y-1">
            <p>
              Email:{" "}
              <a href="mailto:support@luxuryladies.com" className="text-primary hover:underline font-medium">
                support@luxuryladies.com
              </a>
            </p>
            <p>
              Phone / WhatsApp:{" "}
              <a href="tel:+8801540010960" className="text-primary hover:underline font-medium">
                +8801540010960
              </a>
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
