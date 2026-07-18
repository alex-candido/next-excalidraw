import { cn } from "@/lib/utils";

// h-16 abaixo, em px — fonte única pra quem precisa descontar essa altura
// (ex: scrollToElement em conteúdo que fica atrás do header sticky).
export const LAYOUT_HEADER_HEIGHT_PX = 64;

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
