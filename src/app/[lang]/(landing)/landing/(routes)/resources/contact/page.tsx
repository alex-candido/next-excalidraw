export default async function ContactPage() {
  const { default: Content } = await import("@/content/landing/support/contact.mdx");

  return (
    <div className="landing-resources-contact-page">
      <Content />
    </div>
  );
}
