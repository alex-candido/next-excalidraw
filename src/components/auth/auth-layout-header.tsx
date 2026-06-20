import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutNavBrand } from "@/components/layouts/layout-nav-brand";

import { AuthNavBrand } from "@/components/auth/auth-nav-brand";

export function AuthLayoutHeader() {
  return (
    <LayoutHeader>
      <LayoutContainer>
        <LayoutNavBrand>
          <AuthNavBrand />
        </LayoutNavBrand>
      </LayoutContainer>
    </LayoutHeader>
  );
}
