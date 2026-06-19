import { cn } from "@/lib/utils";

export function LayoutWrapper({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("layout-wrapper flex flex-col flex-1", className)} {...props}>
      {children}
    </div>
  );
}
