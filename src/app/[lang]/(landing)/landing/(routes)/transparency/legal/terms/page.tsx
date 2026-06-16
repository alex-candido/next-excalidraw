export default async function TermsPage() {
  const { default: Content } = await import("@/content/landing/transparency/terms.mdx");

  return (
    <div className="landing-transparency-legal-terms-page">
      <Content />
    </div>
  );
}
