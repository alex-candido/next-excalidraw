import { cn } from "@/lib/utils";

import { AppCommunityFilters } from "@/components/app/community/app-community-filters";
import { AppCommunityTags } from "@/components/app/community/app-community-tags";

export function AppCommunityToolbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("app-community-toolbar flex flex-col gap-3", className)}
      {...props}
    >
      <AppCommunityFilters />
      <AppCommunityTags />
    </div>
  );
}
