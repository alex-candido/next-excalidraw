export default async function ProductPage() {
  const { default: Content } = await import("@/content/landing/product/index.mdx");

  return (
    <div className="landing-product-page">
      <Content />
    </div>
  );
}
