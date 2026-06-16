import { Skeleton } from "@/components/ui/skeleton";

export function LandingHomeProductPreview() {
  return (
    <div className="landing-home-product-preview w-full max-w-4xl">
      <Skeleton className="w-full h-96 rounded-lg" />
    </div>
  );
}
