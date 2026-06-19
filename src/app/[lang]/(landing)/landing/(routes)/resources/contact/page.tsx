export default async function ContactPage() {
  const { default: Content } = await import("@/content/landing/resources/contact.mdx");

  return (
    <div className="landing-resources-contact-page">
      <Content />
    </div>
  );
}
