import { useTranslations } from "next-intl";

export function AppStartNewModalFeatures() {
  const t = useTranslations("app.new.features");
  const items = t.raw("items") as string[];

  return (
    <div className="app-start-new-modal-features flex flex-col gap-2 rounded-xl bg-muted/50 p-3">
      <span className="app-start-new-modal-features-label text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("label")}
      </span>
      <ul className="app-start-new-modal-features-list flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="app-start-new-modal-features-item flex items-start gap-2"
          >
            <span className="app-start-new-modal-features-bullet mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
            <span className="text-xs text-muted-foreground leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
