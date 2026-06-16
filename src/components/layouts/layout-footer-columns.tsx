import { cn } from "@/lib/utils";

export function LayoutFooterColumns({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-footer-columns grid w-full grid-cols-2 gap-8 md:grid-cols-4", className)} {...props}>
      {children}
    </div>
  );
}
