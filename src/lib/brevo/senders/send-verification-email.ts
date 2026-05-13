import { createElement } from "react";
import { sendEmail } from "@/lib/brevo";
import { VerifyEmailTemplate } from "@/components/emails/verify-email";

export async function sendVerificationEmail(to: string, url: string) {
  return sendEmail({
    to,
    subject: "Verifique seu e-mail",
    react: createElement(VerifyEmailTemplate, { url }),
  });
}
