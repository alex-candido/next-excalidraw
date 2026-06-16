import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

const links = [
  { label: "Product", href: "/landing/home#product" },
  { label: "Features", href: "/landing/home#features" },
  { label: "Pricing", href: "/landing/home#pricing" },
  { label: "What's new", href: "/landing/product/updates" },
] as const;

export function LandingNavMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {links.map(({ label, href }) => (
          <NavigationMenuItem key={href}>
            <NavigationMenuLink href={href}>{label}</NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
