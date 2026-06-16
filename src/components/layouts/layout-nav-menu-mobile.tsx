import { cn } from "@/lib/utils";

export function LayoutNavMenuMobile({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-nav-menu-mobile flex md:hidden items-center", className)} {...props}>
      {children}
    </div>
  );
}
