import Link from "next/link";

import { Muted, Small } from "@/components/ui/typography";

type LandingFooterNavProps = {
  label: string;
  links: readonly { label: string; href: string }[];
};

export function LandingFooterNav({ label, links }: LandingFooterNavProps) {
  return (
    <div className="landing-footer-nav flex flex-col gap-3">
      <Small className="uppercase tracking-wider text-muted-foreground">{label}</Small>
      <ul className="flex flex-col gap-2">
        {links.map(({ label: linkLabel, href }) => (
          <li key={href}>
            <Link href={href} className="transition-colors hover:text-foreground">
              <Muted>{linkLabel}</Muted>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
