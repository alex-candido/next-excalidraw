import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface ResetPasswordEmailTemplateProps {
  url: string;
}

export function ResetPasswordEmailTemplate({ url }: ResetPasswordEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Redefina sua senha do Next Excalidraw</Preview>
      <Tailwind>
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto px-6 py-10 max-w-[560px] rounded-lg">
            <Heading className="text-2xl font-semibold text-[#1a1a1a] mb-4">
              Redefinição de senha
            </Heading>
            <Text className="text-base text-[#444] leading-6 mb-6">
              Recebemos uma solicitação para redefinir a senha da sua conta.
              Clique no botão abaixo para continuar.
            </Text>
            <Section className="mb-6">
              <Button
                href={url}
                className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-md no-underline"
              >
                Redefinir senha
              </Button>
            </Section>
            <Text className="text-[13px] text-[#999] m-0">
              Se você não solicitou a redefinição de senha, ignore este e-mail.
              O link expira em 1 hora.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
