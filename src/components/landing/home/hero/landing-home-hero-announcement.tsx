import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function LandingHomeHeroAnnouncement() {
  return (
    <Link
      href="/landing/resources/blog"
      className="landing-home-hero-announcement inline-flex max-w-[280px] items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:max-w-none"
    >
      <Badge variant="secondary" className="shrink-0 rounded-full px-2 py-0 text-xs">New</Badge>
      <span className="truncate">Introducing Next Excalidraw: A New Era of Visual Collaboration</span>
      <ArrowRight className="shrink-0 size-3" />
    </Link>
  );
}
