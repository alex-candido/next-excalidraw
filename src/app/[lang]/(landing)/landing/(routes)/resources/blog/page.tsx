import { LandingResourcesBlogFeed } from "@/components/landing/resources/blog/landing-resources-blog-feed";
import { LandingResourcesBlogHero } from "@/components/landing/resources/blog/landing-resources-blog-hero";

export default function BlogPage() {
  return (
    <div className="landing-resources-blog-page">
      <LandingResourcesBlogHero />
      <LandingResourcesBlogFeed />
    </div>
  );
}
