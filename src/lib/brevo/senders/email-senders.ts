import { createElement } from "react";
import { emailClient } from "@/lib/brevo";
import { ResetPasswordEmailTemplate } from "@/components/emails/reset-password-email";
import { VerifyEmailTemplate } from "@/components/emails/verify-email";

export function emailSenders() {
  async function sendResetPassword(to: string, url: string) {
    return emailClient().send({
      to,
      subject: "Redefina sua senha",
      react: createElement(ResetPasswordEmailTemplate, { url }),
    });
  }

  async function sendVerification(to: string, url: string) {
    return emailClient().send({
      to,
      subject: "Verifique seu e-mail",
      react: createElement(VerifyEmailTemplate, { url }),
    });
  }

  return { sendResetPassword, sendVerification }
}
