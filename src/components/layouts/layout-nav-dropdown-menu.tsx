import { cn } from "@/lib/utils";

export function LayoutNavDropdownMenu({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-nav-dropdown-menu hidden md:flex items-center", className)} {...props}>
      {children}
    </div>
  );
}
