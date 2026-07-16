import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  PresentationLanguage,
  PresentationType,
} from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";
import { LANGUAGE_CODE } from "@/schemas/app/presentation-schema";

import {
  AppPresentationCardActions,
  type PresentationActionKey,
} from "@/components/app/app-presentation-card-actions";
import { AppPresentationCardFavorite } from "@/components/app/app-presentation-card-favorite";

type AppPresentationCardProps = {
  title: string;
  type: (typeof PresentationType)[keyof typeof PresentationType];
  language?: (typeof PresentationLanguage)[keyof typeof PresentationLanguage];
  slideCount?: number;
  typeLabel: string;
  createdAtLabel: string;
  createdBy: string;
  actions?: PresentationActionKey[];
  isFavorited?: boolean;
  onTrashConfirm?: () => void;
  className?: string;
} & (
  | { href: string; onSelect?: never }
  | { href?: never; onSelect: () => void }
);

export function AppPresentationCard({
  title,
  type,
  language,
  slideCount,
  typeLabel,
  createdAtLabel,
  createdBy,
  actions,
  isFavorited,
  onTrashConfirm,
  className,
  ...rest
}: AppPresentationCardProps) {
  const href = "href" in rest ? rest.href : undefined;
  const onSelect = "onSelect" in rest ? rest.onSelect : undefined;

  return (
    <div
      className={cn(
        "app-presentation-card relative aspect-video overflow-hidden rounded-lg border bg-muted",
        className,
      )}
    >
      {onSelect ? (
        <button
          className="app-presentation-card-thumbnail absolute inset-0 z-0 cursor-pointer"
          onClick={onSelect}
          aria-label={title}
        />
      ) : href ? (
        <Link
          href={href}
          className="app-presentation-card-thumbnail absolute inset-0 z-0"
          aria-label={title}
        />
      ) : null}

      <div className="app-presentation-card-badges absolute left-2 top-2 z-10 flex items-center gap-1.5">
        <Badge
          variant={type === PresentationType.multi ? "secondary" : "outline"}
          className="app-presentation-card-type rounded-full bg-background/80 text-xs backdrop-blur-sm"
        >
          {typeLabel}
        </Badge>
        {language !== undefined && (
          <Badge
            variant="outline"
            className="app-presentation-card-language rounded-full bg-background/80 text-xs backdrop-blur-sm"
          >
            {LANGUAGE_CODE[language] ?? "–"}
          </Badge>
        )}
      </div>

      <div className="app-presentation-card-overlay pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
        <div className="app-presentation-card-info flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            {isFavorited && <AppPresentationCardFavorite />}
            <span className="app-presentation-card-title truncate text-sm font-medium leading-snug text-white">
              {title}
            </span>
          </div>
          <span className="app-presentation-card-meta text-xs text-white/60">
            {type === PresentationType.multi && slideCount && slideCount > 0
              ? `${slideCount} slides · ${createdAtLabel}`
              : createdAtLabel}
          </span>
        </div>
        <div className="app-presentation-card-arrow flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <ArrowRight className="size-3.5 text-white" />
        </div>
      </div>

      <div className="app-presentation-card-actions absolute right-2 top-2 z-20">
        <AppPresentationCardActions
          title={title}
          createdAtLabel={createdAtLabel}
          createdBy={createdBy}
          actions={actions}
          isFavorited={isFavorited}
          onTrashConfirm={onTrashConfirm}
        />
      </div>
    </div>
  );
}
