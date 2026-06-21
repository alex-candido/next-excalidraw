import { cn } from "@/lib/utils";

export function AppLayoutShell({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("app-layout-shell flex flex-1 overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}
