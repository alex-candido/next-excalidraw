import { LandingResourcesBlogPostContent } from "@/components/landing/resources/blog/post/landing-resources-blog-post-content";
import { LandingResourcesBlogPostHero } from "@/components/landing/resources/blog/post/landing-resources-blog-post-hero";
import { LandingResourcesBlogPostSuggestions } from "@/components/landing/resources/blog/post/landing-resources-blog-post-suggestions";

type Props = {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="landing-resources-blog-post-page">
      <LandingResourcesBlogPostHero
        category="updates"
        title="Post title"
        date="2026-06-19"
        readTime="2"
      />
      <LandingResourcesBlogPostContent />
      <LandingResourcesBlogPostSuggestions />
    </div>
  );
}
