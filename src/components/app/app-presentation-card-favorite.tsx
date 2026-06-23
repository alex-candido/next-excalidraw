import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function AppPresentationCardFavorite({
  className,
}: {
  className?: string;
}) {
  return (
    <Star
      className={cn(
        "app-presentation-card-favorite size-3 shrink-0 fill-yellow-400 text-yellow-400",
        className,
      )}
    />
  );
}
