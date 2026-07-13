import { Resend } from "resend";
import { env } from "@/config/env-config";
import type { ReactElement } from "react";

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
}

export function emailClient() {
  async function send({ to, subject, react }: SendEmailOptions) {
    return resend.emails.send({
      from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS ?? "onboarding@resend.dev"}>`,
      to,
      subject,
      react,
    });
  }

  return { send }
}
