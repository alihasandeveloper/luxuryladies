import { Metadata } from "next";
import Link from "next/link";
import { 
  Sparkles, 
  ShoppingBag, 
  DollarSign, 
  Truck, 
  HeartHandshake, 
  ShieldCheck, 
  Lock, 
  Headphones, 
  Mail, 
  Phone, 
  Globe, 
  ArrowRight 
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | luxuryladies",
  description:
    "Welcome to luxuryladies, your premier online luxury fashion destination in Bangladesh. Discover our story, mission, and commitment to quality.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-[#FAFAFA]">
      {/* ── Hero / Banner Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-[#FFF9FA] to-white py-16 md:py-24 border-b border-[#F7E7EC]">
        <div className="container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#F2D7E2] shadow-xs mb-5">
            <Sparkles size={14} className="text-[#ff0080]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#ff0080]">
              The luxuryladies Story
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1f191c] mb-6 leading-tight">
            Welcome to <span className="text-[#ff0080]">luxuryladies</span>
          </h1>

          <p className="text-base md:text-lg text-[#55474D] leading-relaxed max-w-2xl mx-auto mb-4">
            Your premier online shopping destination in Bangladesh. We are dedicated to making your shopping experience effortless, enjoyable, and rewarding.
          </p>

          <p className="text-sm md:text-base text-[#77666D] leading-relaxed max-w-2xl mx-auto">
            At luxuryladies, we believe shopping should be simple and accessible to everyone. That&apos;s why we offer a wide variety of high-quality products, ranging from fashion and beauty to luxury heels, bags, home essentials, and beyond—all at competitive prices.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/shop"
              className="px-6 py-3 rounded-full bg-[#ff0080] hover:bg-[#d4006a] !text-white text-xs md:text-sm font-semibold transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span className="!text-white text-inherit">Explore Our Collection</span>
              <ArrowRight size={15} className="!text-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Main Container ── */}
      <div className="container max-w-5xl py-12 md:py-20 space-y-16 md:space-y-24">

        {/* ── Who We Are & Mission Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Who We Are */}
          <div className="bg-white rounded-2xl p-7 md:p-10 border border-[#F2E4EA] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#FFF0F5] text-[#ff0080] flex items-center justify-center mb-5">
                <ShoppingBag size={22} strokeWidth={2} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1f191c] mb-3">
                Who We Are
              </h2>
              <p className="text-sm md:text-base text-[#66545B] leading-relaxed">
                Founded with the vision to revolutionize eCommerce in Bangladesh, luxuryladies is more than just an online store. We are a team of passionate individuals committed to providing you with the best products and services. Our goal is to empower shoppers with choice, convenience, and trust.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#F8EEF1] flex items-center gap-2 text-xs font-semibold text-[#ff0080]">
              <span>Classy • Comfort • Casual</span>
            </div>
          </div>

          {/* Our Mission */}
          <div className="bg-gradient-to-br from-[#111827] to-[#1f1620] text-white rounded-2xl p-7 md:p-10 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-white/10 text-[#ff0080] flex items-center justify-center mb-5">
                <HeartHandshake size={22} strokeWidth={2} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                Our Mission
              </h2>
              <p className="text-sm md:text-base text-[#d1c7cb] leading-relaxed">
                To become the most reliable and customer-friendly eCommerce platform in Bangladesh by continuously enhancing our offerings, logistics, and personalized customer care services.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-white/80">
              <span>Customer First Approach</span>
            </div>
          </div>
        </section>

        {/* ── What We Offer ── */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-10 md:mb-12">
            <span className="text-xs font-semibold tracking-widest text-[#ff0080] uppercase block mb-2">
              Values & Standards
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1f191c]">
              What We Offer
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <ShoppingBag size={20} strokeWidth={2} />,
                title: "A Wide Product Range",
                desc: "From everyday essentials to luxury items, we've got something for everyone.",
              },
              {
                icon: <DollarSign size={20} strokeWidth={2} />,
                title: "Affordable Pricing",
                desc: "We ensure the best value for your money without compromising quality.",
              },
              {
                icon: <Truck size={20} strokeWidth={2} />,
                title: "Fast Delivery",
                desc: "Our efficient logistics ensure your orders reach your doorstep quickly and securely.",
              },
              {
                icon: <HeartHandshake size={20} strokeWidth={2} />,
                title: "Customer Satisfaction",
                desc: "Our priority is to create a smooth, rewarding shopping experience for every customer.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-[#F2E4EA] hover:border-[#ff0080]/40 transition-all duration-300 shadow-xs hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FFF2F7] text-[#ff0080] flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-[#1f191c] mb-2">{item.title}</h3>
                <p className="text-xs md:text-sm text-[#77666D] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="bg-white rounded-2xl p-8 md:p-12 border border-[#F2E4EA] shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold tracking-widest text-[#ff0080] uppercase block mb-2">
              Your Peace of Mind
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1f191c]">
              Why Choose Us?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F5] text-[#ff0080] flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-[#1f191c] mb-2">Quality Assurance</h3>
              <p className="text-xs md:text-sm text-[#66545B] leading-relaxed">
                Every product is carefully selected and inspected to meet your highest expectations.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F5] text-[#ff0080] flex items-center justify-center mb-4">
                <Lock size={24} />
              </div>
              <h3 className="text-base font-bold text-[#1f191c] mb-2">Secure Shopping</h3>
              <p className="text-xs md:text-sm text-[#66545B] leading-relaxed">
                Enjoy a safe and reliable online shopping experience with fully secure payment options.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F5] text-[#ff0080] flex items-center justify-center mb-4">
                <Headphones size={24} />
              </div>
              <h3 className="text-base font-bold text-[#1f191c] mb-2">Exceptional Support</h3>
              <p className="text-xs md:text-sm text-[#66545B] leading-relaxed">
                Our dedicated customer service team is always here to help with your questions and concerns.
              </p>
            </div>
          </div>
        </section>

        {/* ── Join Our Journey ── */}
        <section className="bg-gradient-to-r from-[#FFF0F5] via-[#FFF6F9] to-white rounded-2xl p-8 md:p-12 border border-[#F2D7E2] text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1f191c] mb-4">
            Join Our Journey
          </h2>
          <p className="text-sm md:text-base text-[#66545B] leading-relaxed mb-4">
            At luxuryladies, we are constantly growing and innovating to meet your needs. Whether you&apos;re shopping for yourself or finding the perfect gift, we&apos;re here to make it an enjoyable experience.
          </p>
          <p className="text-xs md:text-sm font-semibold text-[#ff0080] uppercase tracking-wide">
            Thank you for choosing luxuryladies—your trust is the driving force behind our success.
          </p>
        </section>

        {/* ── Contact Us ── */}
        <section className="bg-white rounded-2xl p-8 md:p-10 border border-[#F2E4EA] shadow-xs">
          <div className="text-center max-w-md mx-auto mb-8">
            <span className="text-xs font-semibold tracking-widest text-[#ff0080] uppercase block mb-2">
              Get in Touch
            </span>
            <h2 className="text-2xl font-bold text-[#1f191c]">
              Contact Us
            </h2>
            <p className="text-xs text-[#887880] mt-1">
              luxuryladies: Classy, Comfort, Casual!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <a
              href="mailto:support@luxuryladies.com"
              className="flex flex-col items-center text-center p-5 rounded-xl bg-[#FAFAFA] hover:bg-[#FFF0F5] transition-colors group border border-transparent hover:border-[#F2D7E2]"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-xs text-[#ff0080] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail size={18} />
              </div>
              <span className="text-xs font-semibold text-[#887880] uppercase mb-1">Email</span>
              <span className="text-xs md:text-sm font-medium text-[#1f191c] group-hover:text-[#ff0080] transition-colors">
                support@luxuryladies.com
              </span>
            </a>

            <a
              href="tel:+8801XXXXXXXX"
              className="flex flex-col items-center text-center p-5 rounded-xl bg-[#FAFAFA] hover:bg-[#FFF0F5] transition-colors group border border-transparent hover:border-[#F2D7E2]"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-xs text-[#ff0080] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Phone size={18} />
              </div>
              <span className="text-xs font-semibold text-[#887880] uppercase mb-1">Phone</span>
              <span className="text-xs md:text-sm font-medium text-[#1f191c] group-hover:text-[#ff0080] transition-colors">
                +8801XXXXXXXX
              </span>
            </a>

            <a
              href="https://www.luxuryladies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-center p-5 rounded-xl bg-[#FAFAFA] hover:bg-[#FFF0F5] transition-colors group border border-transparent hover:border-[#F2D7E2]"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-xs text-[#ff0080] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Globe size={18} />
              </div>
              <span className="text-xs font-semibold text-[#887880] uppercase mb-1">Website</span>
              <span className="text-xs md:text-sm font-medium text-[#1f191c] group-hover:text-[#ff0080] transition-colors">
                www.luxuryladies.com
              </span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
