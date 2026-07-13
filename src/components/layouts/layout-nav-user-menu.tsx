import { cn } from "@/lib/utils";

export function LayoutNavUserMenu({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-nav-user-menu flex items-center", className)} {...props}>
      {children}
    </div>
  );
}
