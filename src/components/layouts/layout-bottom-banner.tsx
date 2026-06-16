import { cn } from "@/lib/utils";

export function LayoutBottomBanner({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-bottom-banner border-t border-border px-4 py-2 text-center", className)} {...props}>
      {children}
    </div>
  )
}
