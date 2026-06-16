export default async function LandingHomePage() {
  const { default: Content } = await import("@/content/landing/home/index.mdx");

  return (
    <div className="landing-home-page">
      <Content />
    </div>
  );
}
