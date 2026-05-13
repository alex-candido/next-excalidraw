import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/drizzle";
import { resend } from "@/lib/resend";
import { env } from "@/config/env-config";

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "noreply@nextexcalidraw.com",
        to: user.email,
        subject: "Verifique seu e-mail",
        html: `<p>Clique no link para verificar seu e-mail:</p><a href="${url}">${url}</a>`,
      });
    },
  },
});
