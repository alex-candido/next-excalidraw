"use client";

import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { AuthFormDivider } from "@/components/auth/auth-form-divider";
import { AuthFormOAuth } from "@/components/auth/auth-form-oauth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "@/hooks/use-form";
import { cn } from "@/lib/utils";
import { signUpSchema, type SignUpInput } from "@/schemas/auth-schema";

export function AuthSignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("auth.signUp");
  const tError = useTranslations("auth.error");
  const tValidation = useTranslations("auth.validation");

  const { signUp } = useAuth();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<SignUpInput, unknown>({
    schema: signUpSchema(tValidation),
    defaultValues: { name: "", email: "", password: "" },
    mutationFn: async (data) => {
      const { error } = await signUp(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, formValues) => setSubmittedEmail(formValues.email),
  });

  return (
    <div
      className={cn("auth-sign-up-form w-full max-w-sm", className)}
      {...props}
    >
      <Card className="auth-sign-up-form-card">
        {submittedEmail ? (
          <>
            <CardHeader className="auth-sign-up-form-success-header flex flex-col items-center gap-3 text-center">
              <div className="auth-sign-up-form-success-icon-wrapper flex size-12 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="auth-sign-up-form-success-icon size-6 text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle>{t("success.title")}</CardTitle>
                <CardDescription>{t("success.description", { email: submittedEmail })}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="auth-sign-up-form-success-body">
              <Button
                variant="outline"
                render={<Link href="/auth/sign-in" />}
                nativeButton={false}
                className="auth-sign-up-form-success-back w-full"
              >
                {t("success.backToSignIn")}
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="auth-sign-up-form-header">
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </CardHeader>

            <CardContent className="auth-sign-up-form-body flex flex-col gap-5">
              <Alert
                variant="destructive"
                className={cn("auth-sign-up-form-error", !formState.errors.root && "hidden")}
              >
                <AlertCircle className="size-4" />
                <AlertTitle>{tError("title")}</AlertTitle>
                <AlertDescription>{tError("description")}</AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit} className="auth-sign-up-form-fields flex flex-col gap-4">
                <Field className="auth-sign-up-form-field-name" data-invalid={!!formState.errors.name}>
                  <FieldLabel htmlFor="sign-up-name">{t("fields.name.label")}</FieldLabel>
                  <Input
                    id="sign-up-name"
                    type="text"
                    placeholder={t("fields.name.placeholder")}
                    {...register("name")}
                  />
                  <FieldError errors={[formState.errors.name]} />
                </Field>

                <Field className="auth-sign-up-form-field-email" data-invalid={!!formState.errors.email}>
                  <FieldLabel htmlFor="sign-up-email">{t("fields.email.label")}</FieldLabel>
                  <Input
                    id="sign-up-email"
                    type="email"
                    placeholder={t("fields.email.placeholder")}
                    {...register("email")}
                  />
                  <FieldError errors={[formState.errors.email]} />
                </Field>

                <Field className="auth-sign-up-form-field-password" data-invalid={!!formState.errors.password}>
                  <FieldLabel htmlFor="sign-up-password">{t("fields.password.label")}</FieldLabel>
                  <Input
                    id="sign-up-password"
                    type="password"
                    placeholder={t("fields.password.placeholder")}
                    {...register("password")}
                  />
                  <FieldError errors={[formState.errors.password]} />
                </Field>

                <Button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="auth-sign-up-form-submit w-full"
                >
                  <Loader2
                    className={cn(
                      "auth-sign-up-form-submit-icon size-4 animate-spin",
                      !formState.isSubmitting && "hidden",
                    )}
                  />
                  {formState.isSubmitting ? t("submitting") : t("submit")}
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
          </>
        )}
      </Card>
    </div>
  );
}
