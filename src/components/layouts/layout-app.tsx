import { cn } from "@/lib/utils";

export function LayoutApp({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div aria-description="next-excalidraw-app" className={cn("layout-app min-h-screen flex flex-col", className)} {...props}>
      {children}
    </div>
  );
}
