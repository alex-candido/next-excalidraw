import { cn } from "@/lib/utils";

export function LayoutNavEnd({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-nav-end flex items-center gap-4", className)} {...props}>
      {children}
    </div>
  )
}
