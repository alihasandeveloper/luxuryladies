import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Luxury Ladies",
  description:
    "Learn how Luxury Ladies collects, uses, and protects your personal information when you use our website.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full bg-white py-12 md:py-20 px-4">
      <article className="max-w-3xl mx-auto text-dark">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-dark mb-4">
          Privacy Policy
        </h1>
        <p className="text-xs text-description mb-8">
          Last updated: October 2026
        </p>

        <div className="space-y-4 text-sm md:text-base text-description leading-relaxed">
          <p>
            At <strong className="text-dark font-semibold">Luxury Ladies</strong>, accessible from www.luxuryladies.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by Luxury Ladies and how we use it.
          </p>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
          </p>
        </div>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            1. Information We Collect
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            When you register for an account, place an order, or contact us, we may collect the following information:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-description leading-relaxed">
            <li>Your contact information including full name, phone number, and email address.</li>
            <li>Billing and shipping addresses for order processing and delivery.</li>
            <li>Account credentials such as username and encrypted password.</li>
            <li>Order history, transaction amounts, and item details.</li>
          </ul>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            2. How We Use Your Information
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            We use the information we collect in various ways, including to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-description leading-relaxed">
            <li>Process, fulfill, and ship your orders accurately across Bangladesh.</li>
            <li>Send order confirmation, tracking updates, and delivery notifications via SMS or email.</li>
            <li>Provide customer support and respond to your product or order inquiries.</li>
            <li>Prevent fraudulent transactions and enhance website security.</li>
            <li>Improve our products, inventory, and overall shopping experience.</li>
          </ul>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            3. Payment &amp; Security
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            We prioritize the security of your financial information. Luxury Ladies does not store your credit card or mobile wallet PINs on our servers. All digital payments (such as bKash, Nagad, Visa, Mastercard) are handled through certified, secure third-party payment gateways with industry-standard SSL encryption.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            4. Third-Party Sharing
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties. We only share necessary details (such as your name, delivery address, and phone number) with our verified delivery courier partners solely for the purpose of delivering your packages to your doorstep.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            5. Cookies &amp; Local Storage
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            Like many modern web platforms, Luxury Ladies uses cookies and local browser storage to keep track of items in your shopping cart, remember your login session, and understand how you interact with our catalog to optimize performance.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        <section className="space-y-4 pt-2">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            6. Contact Us
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            If you have any questions or concerns regarding our Privacy Policy or your personal data, please contact us at:
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
