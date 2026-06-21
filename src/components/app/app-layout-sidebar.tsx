import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { AppNavBrand } from "@/components/app/app-nav-brand";
import { AppNavMenu } from "@/components/app/app-nav-menu";
import { AppNavUser } from "@/components/app/app-nav-user";

export function AppLayoutSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <AppNavBrand />
      </SidebarHeader>
      <SidebarContent>
        <AppNavMenu />
      </SidebarContent>
      <SidebarFooter>
        <AppNavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
