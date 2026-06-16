import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingHomeHeroActions() {
  return (
    <div className="landing-home-hero-actions flex items-center gap-4">
      <Button size="lg" render={<Link href="/auth/sign-up" />} nativeButton={false}>
        Get Started for free
      </Button>
      <Button size="lg" variant="outline" render={<Link href="/landing/home#demo" />} nativeButton={false}>
        Watch Demo
      </Button>
    </div>
  );
}
