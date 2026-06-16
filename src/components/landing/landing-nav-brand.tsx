import { PenLine } from "lucide-react";
import Link from "next/link";

export function LandingNavBrand() {
  return (
    <Link href="/landing/home" className="landing-nav-brand flex items-center gap-2 font-semibold text-sm">
      <PenLine className="size-5" />
      <span>Next Excalidraw</span>
    </Link>
  );
}
