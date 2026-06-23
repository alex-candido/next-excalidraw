import { cn } from "@/lib/utils";

import { AppTemplatesFilters } from "@/components/app/templates/app-templates-filters";

export function AppTemplatesToolbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("app-templates-toolbar", className)} {...props}>
      <AppTemplatesFilters />
    </div>
  );
}
