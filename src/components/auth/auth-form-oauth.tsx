"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function AuthFormOAuth({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("auth.oauth");
  const { signInGoogle } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);

  const onGoogleClick = async () => {
    setHasError(false);
    setIsPending(true);

    const { error } = await signInGoogle();

    if (error) {
      setHasError(true);
      setIsPending(false);
    }
  };

  return (
    <div
      className={cn("auth-form-oauth flex flex-col gap-2", className)}
      {...props}
    >
      <Button
        variant="outline"
        disabled={isPending}
        onClick={onGoogleClick}
        className="auth-form-oauth-google w-full"
      >
        {isPending ? (
          <Loader2 className="auth-form-oauth-google-icon size-4 animate-spin" />
        ) : (
          <FcGoogle className="auth-form-oauth-google-icon size-4" />
        )}
        {t("google")}
      </Button>
      {hasError && (
        <p className="auth-form-oauth-error text-sm text-destructive">{t("error")}</p>
      )}
    </div>
  );
}
