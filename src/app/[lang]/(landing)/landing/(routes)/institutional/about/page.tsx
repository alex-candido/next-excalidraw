export default async function AboutPage() {
  const { default: Content } = await import("@/content/landing/institutional/about.mdx");

  return (
    <div className="landing-institutional-about-page">
      <Content />
    </div>
  );
}
