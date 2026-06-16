import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingNavCta() {
  return (
    <>
      <Button variant="ghost" render={<Link href="/auth/sign-in" />} nativeButton={false}>
        Sign In
      </Button>
      <Button render={<Link href="/auth/sign-up" />} nativeButton={false}>
        Get Started
      </Button>
    </>
  );
}
