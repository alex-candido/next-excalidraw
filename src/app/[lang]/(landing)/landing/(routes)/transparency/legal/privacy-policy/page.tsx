export default async function PrivacyPolicyPage() {
  const { default: Content } = await import("@/content/landing/transparency/legal/privacy-policy.mdx");

  return (
    <div className="landing-transparency-legal-privacy-policy-page">
      <Content />
    </div>
  );
}
