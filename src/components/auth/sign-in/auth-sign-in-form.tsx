"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { AuthFormDivider } from "@/components/auth/auth-form-divider";
import { AuthFormOAuth } from "@/components/auth/auth-form-oauth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "@/hooks/use-form";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { signInSchema, type SignInInput } from "@/schemas/auth-schema";

export function AuthSignInForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("auth.signIn");
  const tError = useTranslations("auth.error");
  const tValidation = useTranslations("auth.validation");

  const router = useRouter();
  const { signInCredentials } = useAuth();

  const { register, handleSubmit, formState } = useForm<SignInInput, unknown>({
    schema: signInSchema(tValidation),
    defaultValues: { email: "", password: "" },
    mutationFn: async (data) => {
      const { error } = await signInCredentials(data);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => router.push("/app/start"),
  });

  return (
    <div
      className={cn("auth-sign-in-form w-full max-w-sm", className)}
      {...props}
    >
      <Card className="auth-sign-in-form-card">
        <CardHeader className="auth-sign-in-form-header">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="auth-sign-in-form-body flex flex-col gap-5">
          <Alert
            variant="destructive"
            className={cn("auth-sign-in-form-error", !formState.errors.root && "hidden")}
          >
            <AlertCircle className="size-4" />
            <AlertTitle>{tError("title")}</AlertTitle>
            <AlertDescription>{tError("description")}</AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="auth-sign-in-form-fields flex flex-col gap-4">
            <Field className="auth-sign-in-form-field-email" data-invalid={!!formState.errors.email}>
              <FieldLabel htmlFor="sign-in-email">
                {t("fields.email.label")}
              </FieldLabel>
              <Input
                id="sign-in-email"
                type="email"
                placeholder={t("fields.email.placeholder")}
                {...register("email")}
              />
              <FieldError errors={[formState.errors.email]} />
            </Field>

            <Field className="auth-sign-in-form-field-password" data-invalid={!!formState.errors.password}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="sign-in-password">
                  {t("fields.password.label")}
                </FieldLabel>
                <Link
                  href="/auth/forgot-password"
                  className="auth-sign-in-form-forgot text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("fields.forgotPassword")}
                </Link>
              </div>
              <Input
                id="sign-in-password"
                type="password"
                placeholder={t("fields.password.placeholder")}
                {...register("password")}
              />
              <FieldError errors={[formState.errors.password]} />
            </Field>

            <Button
              type="submit"
              disabled={formState.isSubmitting}
              className="auth-sign-in-form-submit w-full"
            >
              <Loader2
                className={cn(
                  "auth-sign-in-form-submit-icon size-4 animate-spin",
                  !formState.isSubmitting && "hidden",
                )}
              />
              {formState.isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </form>

          <AuthFormDivider />
          <AuthFormOAuth />
        </CardContent>

        <CardFooter className="auth-sign-in-form-footer justify-center">
          <p className="text-sm text-muted-foreground">
            {t("footer.text")}{" "}
            <Link
              href="/auth/sign-up"
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
