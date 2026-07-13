import { Suspense } from "react";

import { AuthResetPasswordForm } from "@/components/auth/reset-password/auth-reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="auth-reset-password-page flex flex-1 items-center justify-center p-4">
      <Suspense>
        <AuthResetPasswordForm />
      </Suspense>
    </div>
  );
}
