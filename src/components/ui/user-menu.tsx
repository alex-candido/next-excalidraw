"use client";

import { LogOut, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@/i18n/navigation";

export interface UserMenuAction {
  key: string;
  label: string;
  icon: ReactNode;
  href: string;
}

interface UserMenuProps {
  actions: UserMenuAction[];
  upgradeHref?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserMenu({ actions, upgradeHref }: UserMenuProps) {
  const t = useTranslations("common.userMenu");
  const { session, signOut } = useAuth();

  if (!session.data) return null;

  const { user } = session.data;
  const group = user.group ?? "guest";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("trigger")}
        className="user-menu-trigger rounded-full"
      >
        <Avatar>
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="user-menu-content w-64">
        <div className="user-menu-header flex items-center gap-3 px-2 py-2">
          <Avatar size="lg">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="user-menu-header-info flex min-w-0 flex-col gap-0.5">
            <span className="user-menu-header-name truncate text-sm font-medium text-foreground">
              {user.name}
            </span>
            <span className="user-menu-header-email truncate text-xs text-muted-foreground">
              {user.email}
            </span>
            <Badge variant="secondary" className="user-menu-header-group mt-1 w-fit capitalize">
              {group}
            </Badge>
          </div>
        </div>

        <DropdownMenuSeparator />

        {upgradeHref && (
          <>
            <DropdownMenuItem
              render={<Link href={upgradeHref} />}
              className="user-menu-upgrade gap-2 text-primary focus:text-primary"
            >
              <Sparkles className="size-4" />
              {t("upgrade")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.key}
              render={<Link href={action.href} />}
              className={`user-menu-action-${action.key} gap-2`}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut()}
          className="user-menu-sign-out gap-2"
        >
          <LogOut className="size-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
