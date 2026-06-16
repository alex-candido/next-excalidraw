import { cn } from "@/lib/utils";

export function LayoutFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("layout-footer border-t border-border px-4 py-8", className)} {...props}>
      {children}
    </footer>
  );
}
