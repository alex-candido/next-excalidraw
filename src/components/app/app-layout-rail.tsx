import { cn } from "@/lib/utils";

export function AppLayoutRail({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <aside
      className={cn(
          "app-layout-rail z-20 flex items-center",
          "fixed bottom-4 left-1/2 -translate-x-1/2",
          "md:translate-x-0 md:left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:flex-col",
          className
        )}
      {...props}
    >
      {children}
    </aside>
  );
}
