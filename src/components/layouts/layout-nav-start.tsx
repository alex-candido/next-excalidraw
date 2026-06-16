import { cn } from "@/lib/utils";

export function LayoutNavStart({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-nav-start hidden md:flex items-center gap-6", className)} {...props}>
      {children}
    </div>
  )
}
