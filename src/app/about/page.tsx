import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Luxury Ladies",
  description:
    "Welcome to Luxury Ladies, your premier destination for contemporary women's luxury fashion, heels, bags, and lifestyle in Bangladesh.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-white py-12 md:py-20 px-4">
      <article className="max-w-3xl mx-auto text-dark">
        {/* Main Title */}
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-dark mb-6">
          Welcome to Luxury Ladies
        </h1>

        {/* Introduction */}
        <div className="space-y-4 text-sm md:text-base text-description leading-relaxed">
          <p>
            Welcome to <strong className="text-dark font-semibold">Luxury Ladies</strong>, your premier online shopping destination in Bangladesh for contemporary women&apos;s luxury fashion. We are dedicated to making your shopping experience effortless, enjoyable, and rewarding.
          </p>
          <p>
            At Luxury Ladies, we believe fashion should be simple, elegant, and accessible to everyone. That&apos;s why we offer a carefully curated collection of high-quality products—ranging from luxury heels, chic bags, and party clutches to comfort flats, sandals, and stylish lifestyle essentials—all at competitive prices.
          </p>
        </div>

        <hr className="my-8 md:my-10 border-border" />

        {/* Who We Are */}
        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            Who We Are
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            Founded with the vision to redefine women&apos;s eCommerce in Bangladesh, Luxury Ladies is more than just an online store. We are a team of passionate fashion enthusiasts committed to providing you with the finest products and exceptional service. Our goal is to empower women with style, confidence, and trust through every piece they wear.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        {/* What We Offer */}
        <section className="space-y-6 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            What We Offer
          </h2>

          <div className="space-y-5">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1">
                A Curated Product Range
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                From everyday comfort footwear to statement party heels and luxury bags, our catalog is thoughtfully selected to cater to every mood, occasion, and season.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1">
                Affordable Pricing
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                We believe true elegance shouldn&apos;t come with an unreasonable price tag. We ensure maximum value for your money without ever compromising on craftsmanship or materials.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1">
                Fast &amp; Reliable Delivery
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                Our streamlined logistics and trusted courier partners ensure your orders reach your doorstep quickly and securely anywhere across Bangladesh.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1">
                Customer Satisfaction
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                Your happiness is our top priority. From hassle-free ordering to prompt after-sales support, we strive to make every interaction smooth and memorable.
              </p>
            </div>
          </div>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        {/* Our Mission */}
        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            Our Mission
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            To become the most reliable, trend-setting, and customer-first fashion destination in Bangladesh by continuously innovating our collections, enhancing delivery speed, and elevating customer care standards.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        {/* Why Choose Us? */}
        <section className="space-y-6 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            Why Choose Us?
          </h2>

          <div className="space-y-5">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1">
                Quality Assurance
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                Every single item goes through rigorous quality checks to ensure flawless finishing, durability, and comfort before dispatch.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1">
                Secure Shopping
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                Shop with complete peace of mind using multiple secure payment methods, including bKash, Nagad, Visa, Mastercard, and Cash on Delivery.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark mb-1">
                Exceptional Support
              </h3>
              <p className="text-sm md:text-base text-description leading-relaxed">
                Our dedicated customer service representatives are always available to help with sizing recommendations, order tracking, and any inquiries.
              </p>
            </div>
          </div>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        {/* Join Our Journey */}
        <section className="space-y-4 mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            Join Our Journey
          </h2>
          <p className="text-sm md:text-base text-description leading-relaxed">
            At Luxury Ladies, we are constantly growing and innovating to bring you the best in contemporary women&apos;s style. Whether you are shopping for your daily wardrobe or finding the perfect statement piece for a wedding or gala, we are honored to be a part of your story.
          </p>
          <p className="text-sm md:text-base text-description leading-relaxed">
            Thank you for choosing Luxury Ladies—your trust and love inspire everything we create.
          </p>
        </section>

        <hr className="my-8 md:my-10 border-border" />

        {/* Contact Us & Tagline */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl md:text-2xl font-bold text-dark">
            Contact Us
          </h2>
          <div className="text-sm md:text-base text-description space-y-1.5">
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
            <p>
              Website:{" "}
              <Link href="/" className="text-primary hover:underline font-medium">
                www.luxuryladies.com
              </Link>
            </p>
          </div>

          <p className="pt-4 text-base md:text-lg font-semibold text-primary italic">
            Luxury Ladies: Classy, Comfort, Casual!
          </p>
        </section>
      </article>
    </div>
  );
}
