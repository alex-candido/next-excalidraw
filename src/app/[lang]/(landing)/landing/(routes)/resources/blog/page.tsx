export default async function BlogPage() {
  const { default: Content } = await import("@/content/landing/resources/blog.mdx");

  return (
    <div className="landing-resources-blog-page">
      <Content />
    </div>
  );
}
