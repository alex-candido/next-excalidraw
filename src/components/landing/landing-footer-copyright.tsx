import { Muted } from "@/components/ui/typography";

export function LandingFooterCopyright() {
  return (
    <Muted>© {new Date().getFullYear()} Next Excalidraw. All rights reserved.</Muted>
  );
}
