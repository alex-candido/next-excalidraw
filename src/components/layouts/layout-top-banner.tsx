import { cn } from "@/lib/utils";

export function LayoutTopBanner({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-top-banner border-b border-border px-4 py-2 text-center", className)} {...props}>
      {children}
    </div>
  )
}
