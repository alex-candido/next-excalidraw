import { cn } from "@/lib/utils";

export function LayoutNavMenu({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-nav-menu flex items-center gap-6", className)} {...props}>
      {children}
    </div>
  );
}
