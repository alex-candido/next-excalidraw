import { createElement } from "react";
import { sendEmail } from "@/lib/brevo";
import { ResetPasswordEmailTemplate } from "@/components/emails/reset-password-email";

export async function sendResetPasswordEmail(to: string, url: string) {
  return sendEmail({
    to,
    subject: "Redefina sua senha",
    react: createElement(ResetPasswordEmailTemplate, { url }),
  });
}
