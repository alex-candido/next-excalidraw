import { BrevoClient } from "@getbrevo/brevo";
import { render } from "@react-email/render";
import { env } from "@/config/env-config";
import type { ReactElement } from "react";

const client = new BrevoClient({ apiKey: env.BREVO_API_KEY ?? "" });

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const html = await render(react);

  return client.transactionalEmails.sendTransacEmail({
    sender: { name: "Next Excalidraw", email: "noreply@nextexcalidraw.com" },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });
}
