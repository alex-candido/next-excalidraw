"use client";

import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "@/hooks/use-form";
import { cn } from "@/lib/utils";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth-schema";

export function AuthForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("auth.forgotPassword");
  const tError = useTranslations("auth.error");
  const tValidation = useTranslations("auth.validation");

  const { requestPasswordReset } = useAuth();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<ForgotPasswordInput, unknown>({
    schema: forgotPasswordSchema(tValidation),
    defaultValues: { email: "" },
    mutationFn: async (data) => {
      const { error } = await requestPasswordReset(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, formValues) => setSubmittedEmail(formValues.email),
  });

  return (
    <div
      className={cn("auth-forgot-password-form w-full max-w-sm", className)}
      {...props}
    >
      <Card className="auth-forgot-password-form-card">
        {submittedEmail ? (
          <>
            <CardHeader className="auth-forgot-password-form-success-header flex flex-col items-center gap-3 text-center">
              <div className="auth-forgot-password-form-success-icon-wrapper flex size-12 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="auth-forgot-password-form-success-icon size-6 text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle>{t("success.title")}</CardTitle>
                <CardDescription>
                  {t.rich("success.description", {
                    email: submittedEmail,
                    strong: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
                  })}
                </CardDescription>
              </div>
            </CardHeader>
          </>
        ) : (
          <>
            <CardHeader className="auth-forgot-password-form-header">
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </CardHeader>

            <CardContent className="auth-forgot-password-form-body flex flex-col gap-5">
              <Alert
                variant="destructive"
                className={cn("auth-forgot-password-form-error", !formState.errors.root && "hidden")}
              >
                <AlertCircle className="size-4" />
                <AlertTitle>{tError("title")}</AlertTitle>
                <AlertDescription>{tError("description")}</AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit} className="auth-forgot-password-form-fields flex flex-col gap-4">
                <Field className="auth-forgot-password-form-field-email" data-invalid={!!formState.errors.email}>
                  <FieldLabel htmlFor="forgot-password-email">{t("fields.email.label")}</FieldLabel>
                  <Input
                    id="forgot-password-email"
                    type="email"
                    placeholder={t("fields.email.placeholder")}
                    {...register("email")}
                  />
                  <FieldError errors={[formState.errors.email]} />
                </Field>

                <Button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="auth-forgot-password-form-submit w-full"
                >
                  <Loader2
                    className={cn(
                      "auth-forgot-password-form-submit-icon size-4 animate-spin",
                      !formState.isSubmitting && "hidden",
                    )}
                  />
                  {formState.isSubmitting ? t("submitting") : t("submit")}
                </Button>
              </form>
            </CardContent>
          </>
        )}

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
