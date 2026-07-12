import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";

export default function PresentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWrapper className="h-screen overflow-hidden">
      <LayoutMain className="min-h-0">
        {children}
      </LayoutMain>
    </LayoutWrapper>
  );
}
