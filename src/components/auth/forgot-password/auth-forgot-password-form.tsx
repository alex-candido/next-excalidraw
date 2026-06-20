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

export function AuthForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("auth.forgotPassword");
  const tError = useTranslations("auth.error");

  return (
    <div
      className={cn("auth-forgot-password-form w-full max-w-sm", className)}
      {...props}
    >
      <Card className="auth-forgot-password-form-card">
        <CardHeader className="auth-forgot-password-form-header">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="auth-forgot-password-form-body flex flex-col gap-5">
          <Alert variant="destructive" className="auth-forgot-password-form-error hidden">
            <AlertCircle className="size-4" />
            <AlertTitle>{tError("title")}</AlertTitle>
            <AlertDescription>{tError("description")}</AlertDescription>
          </Alert>

          <form className="auth-forgot-password-form-fields flex flex-col gap-4">
            <Field className="auth-forgot-password-form-field-email">
              <FieldLabel htmlFor="forgot-password-email">{t("fields.email.label")}</FieldLabel>
              <Input
                id="forgot-password-email"
                type="email"
                placeholder={t("fields.email.placeholder")}
              />
              <FieldError />
            </Field>

            <Button type="submit" className="auth-forgot-password-form-submit w-full">
              <Loader2 className="auth-forgot-password-form-submit-icon hidden size-4 animate-spin" />
              {t("submit")}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="auth-forgot-password-form-footer justify-center">
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
