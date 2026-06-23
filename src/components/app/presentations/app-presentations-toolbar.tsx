import { cn } from "@/lib/utils";

import { AppPresentationsFilters } from "@/components/app/presentations/app-presentations-filters";

export function AppPresentationsToolbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("app-presentations-toolbar", className)}
      {...props}
    >
      <AppPresentationsFilters />
    </div>
  );
}
