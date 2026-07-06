import { AppNavBrand } from "@/components/app/app-nav-brand";
import { AppPresentationsStudioActions } from "@/components/app/presentations/studio/app-presentations-studio-actions";
import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutNavActions } from "@/components/layouts/layout-nav-actions";
import { LayoutNavBrand } from "@/components/layouts/layout-nav-brand";
import { LayoutNavEnd } from "@/components/layouts/layout-nav-end";

export function AppPresentationsStudioHeader() {
  return (
    <LayoutHeader>
      <LayoutContainer className="md:max-w-full!">
        <LayoutNavBrand>
          <AppNavBrand />
        </LayoutNavBrand>
        <LayoutNavEnd>
          <LayoutNavActions>
            <AppPresentationsStudioActions />
          </LayoutNavActions>
        </LayoutNavEnd>
      </LayoutContainer>
    </LayoutHeader>
  );
}
