import { AppTemplatesHero } from "@/components/app/templates/app-templates-hero";
import { AppTemplates } from "@/components/app/templates/app-templates";

export default function TemplatesPage() {
  return (
    <div className="app-templates-page">
      <AppTemplatesHero />
      <AppTemplates />
    </div>
  );
}
