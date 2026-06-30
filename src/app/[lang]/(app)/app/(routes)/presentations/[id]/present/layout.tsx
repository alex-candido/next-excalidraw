import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";

export default function PresentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWrapper>
      <LayoutMain className="pb-20 md:pb-0">
        {children}
      </LayoutMain>
    </LayoutWrapper>
  );
}
