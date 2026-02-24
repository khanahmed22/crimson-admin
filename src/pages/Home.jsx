import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  LogIn,
  ExternalLink,
  Send,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Play,
  Zap,
  TrendingUp,
  Users,
  Lock,
  BarChart3,
  Smartphone,
} from "lucide-react";
import MobileNavDrawer from "@/components/mobiledrawer";
import { useAuth } from "@/store/authStore";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Cloudinary } from "@cloudinary/url-gen";
import {
  AdvancedImage,
  AdvancedVideo,
  lazyload,
  responsive,
} from "@cloudinary/react";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { byRadius } from "@cloudinary/url-gen/actions/roundCorners";
import { focusOn } from "@cloudinary/url-gen/qualifiers/gravity";
import { FocusOn } from "@cloudinary/url-gen/qualifiers/focusOn";
import { quality } from "@cloudinary/url-gen/actions/delivery";
import Aos from "aos";
import "aos/dist/aos.css";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function HomePage() {
  useEffect(() => {
    Aos.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: false,
      mirror: false,
    });
  }, []);

  const { session } = useAuth();
  const contentRef = useRef(null);

  const cld = new Cloudinary({
    cloud: {
      cloudName: "dkkvyxpdc",
    },
  });

  const features = [
    {
      title: "Order Management",
      description:
        "Receive orders in real time, prepare them efficiently, and dispatch smoothly.",
      video: cld
        .video("Live_Orders_lt53hy")
        .format("webm")
        .delivery(quality("auto"))
        .resize(fill().width(1080).height(600)),
    },
    {
      title: "Manage Inventory",
      description:
        "Track stock levels, update items, and prevent out-of-stock issues effortlessly.",
      video: cld
        .video("Inventory_htfojx")
        .format("webm")
        .delivery(quality("auto"))
        .resize(fill().width(1080).height(600)),
    },
    {
      title: "Place an Order",
      description:
        "Create and place customer orders quickly from your admin panel.",
      video: cld
        .video("Place_Order_amjwki")
        .format("webm")
        .delivery(quality("auto"))
        .resize(fill().width(1080).height(600)),
    },
    {
      title: "Set Delivery Zones",
      description:
        "Set delivery areas, control charges, and manage zone-based pricing easily.",
      video: cld
        .video("Delivery_Charges_bvj6ae")
        .format("webm")
        .delivery(quality("auto"))
        .resize(fill().width(1080).height(600)),
    },
    {
      title: "Coupons",
      description:
        "Create discount coupons and run promotions to boost customer sales.",
      video: cld
        .video("Coupon_b4kkvo")
        .format("webm")
        .delivery(quality("auto"))
        .resize(fill().width(1080).height(600)),
    },
    {
      title: "Stylize Your Store",
      description:
        "Customize your store's theme, colors, and branding to match your business.",
      video: cld
        .video("Settings_njbvmq")
        .format("webm")
        .delivery(quality("auto"))
        .resize(fill().width(1080).height(600)),
    },
  ];

  const [current, setCurrent] = useState(0);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % features.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev === 0 ? features.length - 1 : prev - 1));

  useEffect(() => {
    const timer = setInterval(nextSlide, 9000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  useEffect(() => {
    Aos.refreshHard();
  }, [current]);

  Aos.init({
    disable: () => window.innerWidth < 768,
  });

  return (
    <div className="min-h-screen" ref={contentRef}>
      {/* Header */}
      <header className="border-b border-[#e5e7eb] bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 sm:h-20 items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-[#b1111c] rounded-lg flex items-center justify-center">
                <AdvancedImage
                  cldImg={cld
                    .image("My Brand/cc_zm9att")
                    .format("auto")
                    .delivery(quality("auto"))
                    .resize(
                      fill()
                        .aspectRatio("1:1")
                        .gravity(focusOn(FocusOn.faces())),
                    )
                    .roundCorners(byRadius(20))}
                  plugins={[
                    responsive({
                      steps: [200, 320, 400, 640, 800],
                    }),
                  ]}
                  width={400}
                  height={400}
                  loading="eager"
                  fetchPriority="high"
                  alt="logo"
                />
              </div>
              <span className="font-bold text-lg sm:text-xl text-[#1a1a1a] truncate">
                Crimson Castle
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-[#666666] hover:text-[#1a1a1a] relative group transition-colors"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B1111C] group-hover:w-full transition-all duration-300"></span>
              </a>
              <a
                href="#showcase"
                className="text-[#666666] hover:text-[#1a1a1a] relative group transition-colors"
              >
                Our Product
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B1111C] group-hover:w-full transition-all duration-300"></span>
              </a>
              <a
                href="#benefits"
                className="text-[#666666] hover:text-[#1a1a1a] relative group transition-colors"
              >
                Why us?
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B1111C] group-hover:w-full transition-all duration-300"></span>
              </a>

              

              <a
                href="#pricing"
                className="text-[#666666] hover:text-[#1a1a1a] relative group transition-colors"
              >
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B1111C] group-hover:w-full transition-all duration-300"></span>
              </a>

              <a
                href="#faq"
                className="text-[#666666] hover:text-[#1a1a1a] relative group transition-colors"
              >
                FAQ
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B1111C] group-hover:w-full transition-all duration-300"></span>
              </a>

              <a
                href="/knowledge-base"
                className="text-[#666666] hover:text-[#1a1a1a] relative group transition-colors"
              >
                Knowledge Base
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B1111C] group-hover:w-full transition-all duration-300"></span>
              </a>
              
            </nav>

            <div className="flex items-center space-x-2">
              <MobileNavDrawer
                items={[
                  { label: "Features", href: "#features" },
                  {label:"Our Product", href:"#showcase"},
                  { label: "Why Us", href: "#benefits" },
                  
                  { label: "Pricing", href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                  {label: "Knowledge Base",href:"/knowledge-base"}
                ]}
                ctaPrimary={
                  session
                    ? { label: "Dashboard", href: "/dashboard" }
                    : { label: "Sign In", href: "/sign-in" }
                }
              />

              <div className="hidden sm:flex items-center space-x-4">
                {session ? (
                  <a
                    href="/dashboard"
                    className="bg-[#b1111c] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#931017] transition-colors"
                  >
                    Dashboard
                  </a>
                ) : (
                  <a
                    href="/sign-in"
                    className="bg-[#b1111c] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#931017] transition-colors flex items-center gap-2"
                  >
                    <LogIn size={17} /> Sign In
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="overflow-hidden">
        {/* Hero Section - High Impact */}
        <section className="py-6 sm:py-6 md:py-12 bg-gradient-to-br from-[#ffffff] via-[#f9fafb] to-[#ffffff]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex max-md:flex-col-reverse">
              {/* Text - Left */}
              <div className="space-y-6 lg:space-y-8" data-aos="fade-right">
                <div className="flex gap-x-3">
                  
                  <Badge className="bg-[#fef2f2] text-[#b1111c] hover:bg-[#fee2e2] border border-[#fecaca] 
px-4 py-2 sm:px-5 sm:py-2.5 
text-sm sm:text-base 
font-semibold 
rounded-xl">
  👨‍🍳 Built for Home Chefs
</Badge>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl max-md:text-3xl font-bold text-[#1a1a1a] leading-tight">
                  Launch Your Own <span className="text-[#b1111c]">Online Restaurant</span>
                </h1>

                <p className="text-lg  text-[#666666] leading-relaxed">
                  Stop managing orders across Facebook, Instagram, and WhatsApp. One professional platform for everything. Keep 100% of your earnings. No commissions. <span className="font-semibold text-slate-900">Designed for Home Chefs</span>.
                </p>

                <div className="flex gap-4 flex-col sm:flex-row pt-4">
                  <a
                    href="/sign-up"
                    className="group bg-[#b1111c] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#931017] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    Start Now
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="https://pizzatown.crimsoncastle.shop/"
                    target="_blank"
                    className="group bg-[#ffffff] text-[#b1111c] border-2 border-[#b1111c] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#fef2f2] transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Play size={20} />
                    See Live Demo
                  </a>
                </div>

                
              </div>

              {/* Animation - Right */}
              <div className="relative w-full aspect-[16/12]  lg:block" data-aos="fade-left">
                <DotLottieReact src="/Cooking.lottie" loop autoplay />
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 sm:py-20 bg-[#1a1a1a] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl max-md:text-2xl font-bold text-center mb-12">
              The Home Chef Chaos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <div className="p-4 sm:p-6 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                <p className="text-base sm:text-lg font-semibold mb-2">❌ Orders Scattered Everywhere</p>
                <p className="text-[#cccccc] text-sm sm:text-base">Facebook messages, Instagram DMs, WhatsApp texts. Missing orders. Confused customers.</p>
              </div>
              <div className="p-4 sm:p-6 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                <p className="text-base sm:text-lg font-semibold mb-2">❌ No Professional Image</p>
                <p className="text-[#cccccc] text-sm sm:text-base">Managing food business from personal social media looks unprofessional.</p>
              </div>
              <div className="p-4 sm:p-6 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                <p className="text-base sm:text-lg font-semibold mb-2">❌ Manual Everything</p>
                <p className="text-[#cccccc] text-sm sm:text-base">Hand-written notes, Excel sheets, no inventory tracking, no analytics.</p>
              </div>
              <div className="p-4 sm:p-6 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                <p className="text-base sm:text-lg font-semibold mb-2">❌ Can't Scale</p>
                <p className="text-[#cccccc] text-sm sm:text-base">Growing means more orders you can't handle. No system to grow efficiently.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16 sm:py-20 bg-[#fef2f2]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl sm:text-4xl max-md:text-2xl font-bold text-[#1a1a1a] mb-4">
                One Platform. Everything Organized.
              </h2>
              <p className="text-lg max-md:text-sm text-[#666666]">
                Say goodbye to Facebook, Instagram, and WhatsApp chaos. Professional ordering. Inventory. Analytics. All in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#b1111c]" data-aos="fade-up">
                <CheckCircle className="w-8 h-8 text-[#b1111c] mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-2">100% Profit Yours</h3>
                <p className="text-[#666666] text-sm sm:text-base">Zero commission. All revenue stays with you.</p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl" data-aos="fade-up" data-aos-delay="100">
                <Users className="w-8 h-8 text-[#b1111c] mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-2">Own Your Customers</h3>
                <p className="text-[#666666] text-sm sm:text-base">Direct relationships. Their phone numbers. Direct orders forever.</p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl" data-aos="fade-up" data-aos-delay="200">
                <Sparkles className="w-8 h-8 text-[#b1111c] mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-2">Professional Branding</h3>
                <p className="text-[#666666] text-sm sm:text-base">Your logo. Your colors. Your domain. Build YOUR brand.</p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl" data-aos="fade-up" data-aos-delay="300">
                <BarChart3 className="w-8 h-8 text-[#b1111c] mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-2">Complete Analytics</h3>
                <p className="text-[#666666] text-sm sm:text-base">Real profit margins. Daily revenue. Top selling items.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Steps Section */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl max-md:text-2xl font-bold text-center mb-4">
              Live in 3 Simple Steps
            </h2>
            <p className="text-center text-[#666666] text-lg mb-12 max-w-2xl mx-auto">
              From signup to first order in under 24 hours
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="text-center" data-aos="fade-up">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#b1111c] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">
                  1
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2 sm:mb-3">Create Account</h3>
                <p className="text-[#666666] text-sm sm:text-base">Sign up with your Email. Takes 2 minutes.</p>
              </div>

              <div className="text-center" data-aos="fade-up" data-aos-delay="100">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#b1111c] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">
                  2
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2 sm:mb-3">Upload Menu</h3>
                <p className="text-[#666666] text-sm sm:text-base">Excel, PDF, or image. We handle the rest.</p>
              </div>

              <div className="text-center" data-aos="fade-up" data-aos-delay="200">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#b1111c] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">
                  3
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2 sm:mb-3">Start Selling</h3>
                <p className="text-[#666666] text-sm sm:text-base">Share link, get orders. That's it!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Carousel */}
        <section
          id="features"
          className="py-16 sm:py-20 bg-[#f9fafb]"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl max-md:text-2xl font-bold text-[#1a1a1a]">
                Powerful Features Built For You
              </h2>
              <p className="text-lg text-[#666666] max-w-2xl mx-auto">
                Everything you need to run your food business professionally
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl shadow-xl bg-white">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {features.map((item, index) => (
                  <div
                    key={index}
                    className="min-w-full bg-white flex flex-col items-center px-3 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12"
                  >
                    <AdvancedVideo
                      controls
                      cldVid={item.video}
                      autoPlay
                      className="w-full max-w-[900px] h-[150px] sm:h-[250px] md:h-[350px] lg:h-[400px] object-contain mb-4 sm:mb-6 md:mb-8 rounded-xl"
                    />

                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-[#1a1a1a] text-center">
                      {item.title}
                    </h3>

                    <p className="text-sm sm:text-base md:text-lg text-[#666666] text-center max-w-xl px-2 sm:px-0">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                id="previousSlideButton" title="Previous Slide Button"
                onClick={prevSlide}
                className="p-3 rounded-full bg-[#b1111c] text-white hover:bg-[#931017] transition-colors"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex gap-3">
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      idx === current ? "bg-[#b1111c]" : "bg-[#d1d5db]"
                    }`}
                  />
                ))}
              </div>

              <button
                id="nextSlideButton" title="Next Slide Button"
                onClick={nextSlide}
                className="p-3 rounded-full bg-[#b1111c] text-white hover:bg-[#931017] transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </section>

        {/*Showcase*/}

        <section className="py-15 bg-muted/30" id="showcase">
          <div className="container mx-auto px-6 lg:px-12 flex flex-col items-center text-center space-y-10">
            {/* Image */}
            <div className="w-full flex-col justify-center items-center">
              {/* Text Content */}
              <div className="space-y-6 ">
                <h2
                  data-aos="slide-right"
                  className="font-heading font-bold text-2xl md:text-4xl leading-tight text-gray-900"
                >
                  Everything you need to operate your business in one place
                </h2>
                <p
                  data-aos="slide-right"
                  className="text-gray-600 text-lg max-sm:text-sm mb-2"
                >
                  Manage orders, track sales, and grow your business
                  effortlessly with an intuitive dashboard built for modern
                  entrepreneurs.
                </p>
              </div>
              <div
                data-aos="zoom-in"
                className="w-full h-auto rounded-[20px] object-fit border-1 border-slate-300 shadow-xl"
              >
                <AdvancedImage
                  alt="dashboard"
                  width={1500}
                  height={700}
                  plugins={[responsive(), lazyload()]}
                  cldImg={cld
                    .image("dashboard_h9ikdc")
                    .format("webp")
                    .delivery(quality("auto"))
                    .resize(
                      fill()
                        .aspectRatio("16:7") // keeps 16:9 ratio
                        .gravity(focusOn(FocusOn.faces())),
                    )
                    .roundCorners(byRadius(20))}
                />
              </div>
            </div>
          </div>
        </section>


        {/* Benefits Grid */}
        <section id="benefits" className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl max-md:text-2xl font-bold text-center mb-12">
              Why Choose Crimson Castle
            </h2>

            <div className="grid grid-cols-2 max-md:grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
              <div className="p-6 sm:p-8 bg-[#f9fafb] rounded-2xl border border-[#e5e7eb] hover:border-[#b1111c] transition-colors" data-aos="fade-up">
                <TrendingUp className="w-10 sm:w-12 h-10 sm:h-12 text-[#b1111c] mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2">Grow Faster</h3>
                <p className="text-[#666666] text-sm sm:text-base">Keep more profit per order and reinvest in growth</p>
              </div>

              <div className="p-6 sm:p-8 bg-[#f9fafb] rounded-2xl border border-[#e5e7eb] hover:border-[#b1111c] transition-colors" data-aos="fade-up" data-aos-delay="100">
                <Lock className="w-10 sm:w-12 h-10 sm:h-12 text-[#b1111c] mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2">Own Your Data</h3>
                <p className="text-[#666666] text-sm sm:text-base">Customer list, order history, everything is yours</p>
              </div>

              <div className="p-6 sm:p-8 bg-[#f9fafb] rounded-2xl border border-[#e5e7eb] hover:border-[#b1111c] transition-colors" data-aos="fade-up" data-aos-delay="200">
                <BarChart3 className="w-10 sm:w-12 h-10 sm:h-12 text-[#b1111c] mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2">Real Analytics</h3>
                <p className="text-[#666666] text-sm sm:text-base">See actual profits. Know which items earn most</p>
              </div>

              <div className="p-6 sm:p-8 bg-[#f9fafb] rounded-2xl border border-[#e5e7eb] hover:border-[#b1111c] transition-colors" data-aos="fade-up" data-aos-delay="300">
                <Smartphone className="w-10 sm:w-12 h-10 sm:h-12 text-[#b1111c] mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2">Mobile Ready</h3>
                <p className="text-[#666666] text-sm sm:text-base">Works perfectly on all devices</p>
              </div>

             

              <div className="p-6 sm:p-8 bg-[#f9fafb] rounded-2xl border border-[#e5e7eb] hover:border-[#b1111c] transition-colors" data-aos="fade-up" data-aos-delay="500">
                <Zap className="w-10 sm:w-12 h-10 sm:h-12 text-[#b1111c] mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2">Lightning Fast</h3>
                <p className="text-[#666666] text-sm sm:text-base">Orders sent instantly to Dashboard. Zero downtime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2
                data-aos="zoom-out"
                className="font-heading font-bold text-3xl max-md:text-2xl lg:text-4xl text-balance"
              >
                Simple, Transparent Pricing
              </h2>
              <p
                data-aos="zoom-out"
                className="text-xl max-md:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto"
              >
                Start free and scale as you grow. No hidden fees, no surprises.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto px-2">
              {/* Free Plan */}
              <Card
                data-aos="flip-right"
                className="border-2 border-border shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="text-center pb-8">
                  <CardTitle className="font-heading text-2xl max-md:text-lg">
                    Free
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl max-md:text-2xl font-bold">
                      Rs.0
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-4">
                    Perfect for getting started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Up to 5 products</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Basic order management</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Stock tracking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Crimson Castle subdomain</span>
                    </div>
                  </div>
                  <a
                    href="/sign-up"
                    className="bg-[#B1111C] hover:bg-[#cf2f3a] transition-all text-white inline-flex gap-x-2 w-full items-center justify-center p-2 rounded-lg font-semibold shadow-lg"
                    id="signUpButton"
                  >
                    Start Now <ArrowRight size={17} />
                  </a>
                </CardContent>
              </Card>

              {/* Paid Plan */}
              <Card
                data-aos="flip-left"
                className="border-2 border-primary shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#B1111C] text-white  px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="font-heading text-2xl max-md:text-lg">
                    Pro
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl max-md:text-2xl  font-bold">
                      Rs.1400
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-4">
                    Everything you need to scale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>100 products</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Advanced order management</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Smart inventory alerts</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Custom domain</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>No "Powered By Crimson Castle" branding</span>
                    </div>
                  </div>
                  <a
                    href="/sign-up"
                    className="bg-[#B1111C] hover:bg-[#cf2f3a] transition-all text-white inline-flex gap-x-2 w-full items-center justify-center p-2 rounded-lg font-semibold shadow-lg"
                    id="signUpButton"
                  >
                    Start Now <ArrowRight size={17} />
                  </a>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-12"></div>
          </div>
        </section>



        {/*FAQ Section*/}

        <section
          id="faq"
          className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20"
        >
          <h2
            data-aos="slide-right"
            className="mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl text-center font-bold tracking-tight px-4"
          >
            Frequently Asked Questions
          </h2>

          <Accordion
            type="single"
            collapsible
            defaultValue="item-1"
            className="w-full max-w-[700px] mx-auto px-3 sm:px-4 md:px-0"
          >
            {[
              {
                value: "item-1",
                q: "How long does it take to get setup?",
                a: "Setup usually takes between 24 hours, depending on the complexity of your menu and how quickly required details are finalized.",
              },
              {
                value: "item-2",
                q: "Can I cancel the service at any time?",
                a: "Yes. You may cancel your subscription at any time. There are no long-term contracts or cancellation penalties.",
              },
              {
                value: "item-3",
                q: "Are there any hidden or additional fees?",
                a: "There are no mandatory hidden fees.",
              },
              {
                value: "item-4",
                q: "Do you handle food delivery?",
                a: "No. The platform provides online ordering only. Delivery is handled by you.",
              },
            ].map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="border rounded-xl px-5 py-2 mb-3 shadow-sm transition-all data-[state=open]:shadow-md"
              >
                <AccordionTrigger
                  className="
          text-base md:text-lg font-semibold
          hover:no-underline
          transition-colors
          data-[state=open]:text-[#B1111C]
        "
                >
                  {item.q}
                </AccordionTrigger>

                <AccordionContent className="pt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 bg-gradient-to-r from-[#b1111c] to-[#931017] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-5xl max-md:text-2xl font-bold mb-4">
              Stop Losing Money to Commissions
            </h2>
            <p className="text-lg sm:text-xl text-[#fecaca] mb-8 max-w-2xl mx-auto">
              Launch your Online Restaurant today with Crimson Castle
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/sign-up"
                className="bg-white text-[#b1111c] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Start Now
                <ArrowRight size={20} />
              </a>
              <a
                href="https://pizzatown.crimsoncastle.shop/"
                target="_blank"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                See Demo Store
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r bg-[#1a1a1a] ">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <h2 className="font-heading font-bold text-3xl lg:text-4xl max-md:text-lg text-white text-balance">
                Have some questions for us?
              </h2>
              <p className="text-xl text-white text-pretty max-w-2xl mx-auto max-md:text-sm">
                Send us a message and we will get back to you
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact-us"
                  className="bg-white hover:bg-[#B1111C] hover:text-white transition-colors inline-flex gap-x-3 items-center justify-center p-3 rounded-lg font-semibold shadow-lg"
                  id="contactButton"
                >
                  Contact Us <Send size={17} />
                </a>
              </div>
            </div>
          </div>
        </section>


      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <AdvancedImage
                    cldImg={cld
                      .image("My Brand/cc_zm9att")
                      .format("auto")
                    .delivery(quality("auto"))
                      .resize(
                        fill()
                          .aspectRatio("1:1")
                          .gravity(focusOn(FocusOn.faces())),
                      )
                      .roundCorners(byRadius(20))}
                    plugins={[responsive()]}
                    loading="lazy"
                  fetchPriority="low"
                  width={400}
                  height={400}
                    alt="logo"
                  />
                </div>
                <span className="font-heading font-bold text-lg sm:text-xl">
                  Crimson Castle
                </span>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                Empowering Home Chefs to succeed online with simple,
                powerful e-commerce tools.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm">
                <li>
                  <a
                    href="/privacy-policy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms-conditions"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms and Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/refund-policy"
                    className="hover:text-foreground transition-colors"
                  >
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/cancellation-policy"
                    className="hover:text-foreground transition-colors"
                  >
                    Cancellation Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/delivery-policy"
                    className="hover:text-foreground transition-colors"
                  >
                    Delivery Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-sm sm:text-base">Contact Us</h3>
              <p className="text-xs sm:text-sm">Monday to Friday</p>
              <p className="text-xs sm:text-sm mb-2">9 am to 6 pm PKT</p>

              <a
                className="cursor-pointer mt-7 text-sm font-semibold"
                href="/contact-us"
              >
                Contact Here
              </a>
              <p className="mt-3">
                <a
                  href="mailto:info@crimsoncastle.biz"
                  className="hover:text-foreground transition-colors flex items-center gap-x-1 text-sm"
                >
                  Email Us : info@crimsoncastle.biz
                </a>
              </p>

              <div className="flex items-center gap-x-2 mt-3">
                <span>WhatsApp:</span>
                <a
                  href="https://wa.me/923248204806"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-x-1 text-sm"
                >
                  0334-8204806 <ArrowRight />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4 text-sm sm:text-base">Connect With Us</h3>
              <ul className="flex items-center gap-x-3 sm:gap-x-5 text-muted-foreground">
                <li>
                  <a
                    href="https://www.instagram.com/crimsoncastle.biz"
                    target="_blank"
                                        aria-label="Crimson Castle Instagram Page"

                    className="transition-colors hover:text-[#B1111C]"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </li>

                <li>
                  <a
                    href="https://www.facebook.com/profile.php?id=61570768106092"
                    target="_blank"
                                        aria-label="Crimson Castle Facebook Page"

                    className="transition-colors hover:text-[#B1111C]"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                </li>

                <li>
                  <a
                    href="https://linkedin.com/company/crimson-castle-pk"
                    target="_blank"
                                        aria-label="Crimson Castle LinkedIn Page"

                    className="transition-colors hover:text-[#B1111C]"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </li>

                <li>
                  <a
                    href="https://www.youtube.com/@crimsoncastle-o9e"
                    target="_blank"
                    aria-label="Crimson Castle Youtube Page"
                    className="transition-colors hover:text-[#B1111C]"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </li>
              </ul>
              
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">&copy; 2026 Crimson Castle. All rights reserved. </p>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}
