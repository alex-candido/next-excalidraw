import { cn } from "@/lib/utils";

export function LayoutNavCtaMenu({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-nav-cta-menu hidden md:flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}
