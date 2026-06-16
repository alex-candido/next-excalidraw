import { cn } from "@/lib/utils";

export function LayoutNavBrand({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-nav-brand flex items-center", className)} {...props}>
      {children}
    </div>
  );
}
