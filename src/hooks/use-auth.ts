"use client";

import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/better-auth/client";
import type { ForgotPasswordInput, SignInInput, SignUpInput } from "@/schemas/auth-schema";

export function useAuth() {
  const router = useRouter();
  const session = authClient.useSession();

  async function signUp(input: SignUpInput) {
    return authClient.signUp.email({ ...input, callbackURL: "/app/start" });
  }

  async function signInCredentials(input: SignInInput) {
    return authClient.signIn.email(input);
  }

  async function signInGoogle() {
    return authClient.signIn.social({ provider: "google", callbackURL: "/app/start" });
  }

  async function signOut() {
    return authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/"),
      },
    });
  }

  async function requestPasswordReset(input: ForgotPasswordInput) {
    return authClient.requestPasswordReset({
      email: input.email,
      redirectTo: "/auth/reset-password",
    });
  }

  async function resetPassword({ newPassword, token }: { newPassword: string; token: string }) {
    return authClient.resetPassword({ newPassword, token });
  }

  return {
    session,
    signUp,
    signInCredentials,
    signInGoogle,
    signOut,
    requestPasswordReset,
    resetPassword,
  };
}
