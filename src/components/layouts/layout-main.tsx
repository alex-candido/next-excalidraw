import { cn } from "@/lib/utils";

export function LayoutMain({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        "layout-main flex-1 min-h-[calc(100vh-4rem)]",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
