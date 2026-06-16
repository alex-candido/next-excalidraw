import { cn } from "@/lib/utils";

export function LayoutContainer({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-container w-full md:max-w-4/5 mx-auto flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  )
}
