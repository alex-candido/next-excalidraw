import { cn } from "@/lib/utils";

export function LayoutNavActions({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-nav-actions flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}
