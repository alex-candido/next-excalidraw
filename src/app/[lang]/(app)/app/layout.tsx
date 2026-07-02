import { LayoutApp } from "@/components/layouts/layout-app";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <LayoutApp id="app">{children}</LayoutApp>;
}
