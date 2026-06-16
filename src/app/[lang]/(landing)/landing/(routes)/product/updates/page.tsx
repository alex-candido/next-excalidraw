export default async function ProductPage() {
  const { default: Content } = await import("@/content/landing/product/updates/index.mdx");

  return (
    <div className="landing-product-updates-page">
      <Content />
    </div>
  );
}
