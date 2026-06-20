"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { AuthFormDivider } from "@/components/auth/auth-form-divider";
import { AuthFormOAuth } from "@/components/auth/auth-form-oauth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AuthSignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("auth.signUp");
  const tError = useTranslations("auth.error");

  return (
    <div
      className={cn("auth-sign-up-form w-full max-w-sm", className)}
      {...props}
    >
      <Card className="auth-sign-up-form-card">
        <CardHeader className="auth-sign-up-form-header">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="auth-sign-up-form-body flex flex-col gap-5">
          <Alert variant="destructive" className="auth-sign-up-form-error hidden">
            <AlertCircle className="size-4" />
            <AlertTitle>{tError("title")}</AlertTitle>
            <AlertDescription>{tError("description")}</AlertDescription>
          </Alert>

          <form className="auth-sign-up-form-fields flex flex-col gap-4">
            <Field className="auth-sign-up-form-field-name">
              <FieldLabel htmlFor="sign-up-name">{t("fields.name.label")}</FieldLabel>
              <Input
                id="sign-up-name"
                type="text"
                placeholder={t("fields.name.placeholder")}
              />
              <FieldError />
            </Field>

            <Field className="auth-sign-up-form-field-email">
              <FieldLabel htmlFor="sign-up-email">{t("fields.email.label")}</FieldLabel>
              <Input
                id="sign-up-email"
                type="email"
                placeholder={t("fields.email.placeholder")}
              />
              <FieldError />
            </Field>

            <Field className="auth-sign-up-form-field-password">
              <FieldLabel htmlFor="sign-up-password">{t("fields.password.label")}</FieldLabel>
              <Input
                id="sign-up-password"
                type="password"
                placeholder={t("fields.password.placeholder")}
              />
              <FieldError />
            </Field>

            <Button type="submit" className="auth-sign-up-form-submit w-full">
              <Loader2 className="auth-sign-up-form-submit-icon hidden size-4 animate-spin" />
              {t("submit")}
            </Button>
          </form>

          <AuthFormDivider />
          <AuthFormOAuth />
        </CardContent>

        <CardFooter className="auth-sign-up-form-footer justify-center">
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
