"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AuthResetPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("auth.resetPassword");
  const tError = useTranslations("auth.error");

  return (
    <div
      className={cn("auth-reset-password-form w-full max-w-sm", className)}
      {...props}
    >
      <Card className="auth-reset-password-form-card">
        <CardHeader className="auth-reset-password-form-header">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="auth-reset-password-form-body flex flex-col gap-5">
          <Alert variant="destructive" className="auth-reset-password-form-error hidden">
            <AlertCircle className="size-4" />
            <AlertTitle>{tError("title")}</AlertTitle>
            <AlertDescription>{tError("description")}</AlertDescription>
          </Alert>

          <form className="auth-reset-password-form-fields flex flex-col gap-4">
            <Field className="auth-reset-password-form-field-password">
              <FieldLabel htmlFor="reset-password-new">{t("fields.password.label")}</FieldLabel>
              <Input
                id="reset-password-new"
                type="password"
                placeholder={t("fields.password.placeholder")}
              />
              <FieldError />
            </Field>

            <Field className="auth-reset-password-form-field-confirm">
              <FieldLabel htmlFor="reset-password-confirm">{t("fields.confirmPassword.label")}</FieldLabel>
              <Input
                id="reset-password-confirm"
                type="password"
                placeholder={t("fields.confirmPassword.placeholder")}
              />
              <FieldError />
            </Field>

            <Button type="submit" className="auth-reset-password-form-submit w-full">
              <Loader2 className="auth-reset-password-form-submit-icon hidden size-4 animate-spin" />
              {t("submit")}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="auth-reset-password-form-footer justify-center">
          <p className="text-sm text-muted-foreground">
            {t("footer.text")}{" "}
            <Link
              href="/auth/sign-in"
              className="font-medium text-foreground hover:underline"
            >
              {t("footer.link")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
