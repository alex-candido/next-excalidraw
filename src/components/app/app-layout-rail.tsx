import { cn } from "@/lib/utils";

export function AppLayoutRail({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <aside
      className={cn("app-layout-rail absolute left-3 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center", className)}
      {...props}
    >
      {children}
    </aside>
  );
}
