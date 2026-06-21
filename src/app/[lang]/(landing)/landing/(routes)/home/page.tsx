import { LandingHomeCta } from "@/components/landing/home/landing-home-cta";
import { LandingHomeFaq } from "@/components/landing/home/landing-home-faq";
import { LandingHomeFeatures } from "@/components/landing/home/landing-home-features";
import { LandingHomeHero } from "@/components/landing/home/landing-home-hero";
import { LandingHomePricing } from "@/components/landing/home/landing-home-pricing";
import { LandingHomeProduct } from "@/components/landing/home/landing-home-product";
import { LandingHomeTestimonials } from "@/components/landing/home/landing-home-testimonials";

export default function LandingHomePage() {
  return (
    <div className="landing-home-page">
      <LandingHomeHero />
      <LandingHomeProduct />
      <LandingHomeFeatures />
      <LandingHomePricing />
      <LandingHomeTestimonials />
      <LandingHomeCta />
      <LandingHomeFaq />
    </div>
  );
}
