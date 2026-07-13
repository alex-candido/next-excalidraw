"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "@/hooks/use-form";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth-schema";

export function AuthResetPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("auth.resetPassword");
  const tError = useTranslations("auth.error");
  const tValidation = useTranslations("auth.validation");

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword } = useAuth();

  const { register, handleSubmit, formState } = useForm<ResetPasswordInput, unknown>({
    schema: resetPasswordSchema(tValidation),
    defaultValues: { password: "", confirmPassword: "" },
    mutationFn: async (data) => {
      const { error } = await resetPassword({ newPassword: data.password, token });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => router.push("/auth/sign-in"),
  });

  if (!token) {
    return (
      <div
        className={cn("auth-reset-password-form w-full max-w-sm", className)}
        {...props}
      >
        <Card className="auth-reset-password-form-card">
          <CardHeader className="auth-reset-password-form-invalid-header">
            <CardTitle>{t("invalidToken.title")}</CardTitle>
            <CardDescription>{t("invalidToken.description")}</CardDescription>
          </CardHeader>
          <CardFooter className="auth-reset-password-form-invalid-footer justify-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-foreground hover:underline"
            >
              {t("invalidToken.link")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
          <Alert
            variant="destructive"
            className={cn("auth-reset-password-form-error", !formState.errors.root && "hidden")}
          >
            <AlertCircle className="size-4" />
            <AlertTitle>{tError("title")}</AlertTitle>
            <AlertDescription>{tError("description")}</AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="auth-reset-password-form-fields flex flex-col gap-4">
            <Field className="auth-reset-password-form-field-password" data-invalid={!!formState.errors.password}>
              <FieldLabel htmlFor="reset-password-new">{t("fields.password.label")}</FieldLabel>
              <Input
                id="reset-password-new"
                type="password"
                placeholder={t("fields.password.placeholder")}
                {...register("password")}
              />
              <FieldError errors={[formState.errors.password]} />
            </Field>

            <Field className="auth-reset-password-form-field-confirm" data-invalid={!!formState.errors.confirmPassword}>
              <FieldLabel htmlFor="reset-password-confirm">{t("fields.confirmPassword.label")}</FieldLabel>
              <Input
                id="reset-password-confirm"
                type="password"
                placeholder={t("fields.confirmPassword.placeholder")}
                {...register("confirmPassword")}
              />
              <FieldError errors={[formState.errors.confirmPassword]} />
            </Field>

            <Button
              type="submit"
              disabled={formState.isSubmitting}
              className="auth-reset-password-form-submit w-full"
            >
              <Loader2
                className={cn(
                  "auth-reset-password-form-submit-icon size-4 animate-spin",
                  !formState.isSubmitting && "hidden",
                )}
              />
              {formState.isSubmitting ? t("submitting") : t("submit")}
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
