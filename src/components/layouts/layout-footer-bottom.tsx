import { cn } from "@/lib/utils";

export function LayoutFooterBottom({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-footer-bottom flex w-full items-center justify-between border-t border-border pt-6", className)} {...props}>
      {children}
    </div>
  );
}
