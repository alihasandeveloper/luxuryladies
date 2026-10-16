import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delivery & Shipping Policy | Luxury Ladies",
  description:
    "Learn about our nationwide delivery timelines, shipping charges, and tracking for Luxury Ladies orders in Bangladesh.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="w-full bg-white py-12 md:py-20 px-4">
      <article className="max-w-3xl mx-auto text-dark">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-dark mb-4">
          Delivery &amp; Shipping Policy
        </h1>
        <p className="text-xs text-description mb-8">
          Last updated: October 2026
        </p>

        <div className="space-y-4 text-sm md:text-base text-description leading-relaxed">
          <p>
            At <strong className="text-dark font-semibold">Luxury Ladies</strong>, we are committed to delivering your favorite fashion pieces quickly, safely, and seamlessly anywhere in Bangladesh. Please review our shipping policy below to understand our delivery process and timelines.
          </p>
        </div>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            1. Delivery Coverage
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            We deliver nationwide across all 64 districts in Bangladesh through our trusted and verified courier partners (such as Steadfast, Pathao, and RedX).
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            2. Delivery Timelines
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-description leading-relaxed">
            <li>
              <strong className="text-dark">Inside Dhaka:</strong> Usually delivered within <strong>24 to 48 hours</strong> after order confirmation.
            </li>
            <li>
              <strong className="text-dark">Outside Dhaka / Sub-urban:</strong> Usually delivered within <strong>2 to 4 business days</strong> after dispatch.
            </li>
          </ul>
          <p className="text-xs md:text-sm text-description italic">
            *Delivery times may vary slightly during public holidays, festivals (Eid, Puja), or extreme weather conditions.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            3. Shipping Charges
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-description leading-relaxed">
            <li><strong>Inside Dhaka Delivery:</strong> Tk 70 - 80 (standard parcel fee)</li>
            <li><strong>Outside Dhaka Delivery:</strong> Tk 130 - 150 (nationwide parcel fee)</li>
          </ul>
          <p className="text-sm md:text-base text-description leading-relaxed">
            Shipping fees are clearly displayed at checkout before you finalize your order. Special free shipping promotions may apply during seasonal offers.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            4. Order Tracking
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            Once your order is processed and dispatched, you will receive an SMS and email notification with your Order ID and courier tracking details. You can also track your live shipment status anytime using our{" "}
            <Link href="/track-order" className="text-primary hover:underline font-medium">
              Track Your Order
            </Link>{" "}
            page.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            5. Receiving Your Parcel
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            Please inspect the exterior packaging at the time of delivery. In the rare event that the package appears severely torn, opened, or damaged, you may inform the delivery agent immediately and contact our customer service team.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 pt-2">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            6. Questions About Delivery?
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            For any delivery queries or special dispatch requests, please get in touch with our team:
          </p>
          <div className="text-sm md:text-base text-description space-y-1">
            <p>
              Email:{" "}
              <a href="mailto:support@luxuryladies.com" className="text-primary hover:underline font-medium">
                support@luxuryladies.com
              </a>
            </p>
            <p>
              Phone:{" "}
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
