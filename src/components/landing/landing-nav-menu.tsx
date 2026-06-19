import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export async function LandingNavMenu() {
  const t = await getTranslations("landing.nav");

  const products = [
    {
      label: t("products.multi.label"),
      description: t("products.multi.description"),
      href: "/landing/product/multi",
    },
    {
      label: t("products.single.label"),
      description: t("products.single.description"),
      href: "/landing/product/single",
    },
  ] as const;

  const links = [
    { label: t("features"), href: "/landing/home#features" },
    { label: t("pricing"), href: "/landing/home#pricing" },
    { label: t("whatsNew"), href: "/landing/product/updates" },
  ] as const;

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t("product")}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="landing-nav-menu-product-list w-72 flex flex-col p-1">
              {products.map(({ label, description, href }, index) => (
                <li key={href}>
                  <NavigationMenuLink
                    href={href}
                    className="flex flex-col items-start gap-1 px-3 py-2.5"
                  >
                    <span className="text-sm font-semibold leading-none">{label}</span>
                    <span className="text-xs text-muted-foreground leading-snug">{description}</span>
                  </NavigationMenuLink>
                  {index < products.length - 1 && <Separator className="my-1" />}
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {links.map(({ label, href }) => (
          <NavigationMenuItem key={href}>
            <NavigationMenuLink href={href}>{label}</NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
