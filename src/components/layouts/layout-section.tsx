import { cn } from "@/lib/utils";

export function LayoutSection({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("layout-section pb-24 px-4 first:pt-20 first-of-type:pt-20 md:pb-32 md:first:pt-28", className)} {...props}>
      {children}
    </section>
  )
}
