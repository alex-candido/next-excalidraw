import { FaGithub, FaLinkedin } from "react-icons/fa";
import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const members = [
  {
    name: "Alex Cândido",
    role: "Founder & Engineer",
    initials: "AC",
    bio: "Full stack engineer with a focus on AI-driven products and developer tooling. Built Next Excalidraw from scratch — from the AI pipeline to the canvas renderer — driven by a belief that visual thinking should be effortless.",
    github: "https://github.com/alexcndd",
    linkedin: "https://linkedin.com/in/alexcndd",
  },
] as const;

export async function LandingInstitutionalTeamMembers({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.institutional.team.members");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-institutional-team-team w-full max-w-3xl mx-auto flex flex-col gap-6",
            className,
          )}
          {...props}
        >
          <Muted className="text-xs uppercase tracking-wide font-semibold">
            {t("label")}
          </Muted>

          <div className="landing-institutional-team-team-list grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={member.name}
                className="landing-institutional-team-team-member flex flex-col gap-4 rounded-lg border p-6"
              >
                <Avatar className="size-14">
                  <AvatarFallback className="text-base font-semibold">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{member.name}</span>
                  <Muted className="text-xs">{member.role}</Muted>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {member.bio}
                </p>

                <div className="flex items-center gap-3">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="GitHub"
                  >
                    <FaGithub className="size-4" />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin className="size-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
