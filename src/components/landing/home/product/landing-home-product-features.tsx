import { Small } from "@/components/ui/typography";

export function LandingHomeProductFeatures() {
  return (
    <ul className="landing-home-product-features flex flex-wrap items-center justify-center gap-3">
      <li><Small>AI-generated slides</Small></li>
      <li><Small>Excalidraw canvas</Small></li>
      <li><Small>Edit and export</Small></li>
    </ul>
  );
}
