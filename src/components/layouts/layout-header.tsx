import { cn } from "@/lib/utils";

export function LayoutHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header className={cn("layout-header h-16 border-b border-border flex items-center justify-between px-4 sticky top-0 backdrop-blur-sm z-10", className)} {...props}>
      {children}
    </header>
  );
}
