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

interface VerifyEmailTemplateProps {
  url: string;
}

export function VerifyEmailTemplate({ url }: VerifyEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Verifique seu e-mail para acessar o Next Excalidraw</Preview>
      <Tailwind>
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto px-6 py-10 max-w-140 rounded-lg">
            <Heading className="text-2xl font-semibold text-[#1a1a1a] mb-4">
              Verifique seu e-mail
            </Heading>
            <Text className="text-base text-[#444] leading-6 mb-6">
              Clique no botão abaixo para verificar seu endereço de e-mail e ativar sua conta.
            </Text>
            <Section className="mb-6">
              <Button
                href={url}
                className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-md no-underline"
              >
                Verificar e-mail
              </Button>
            </Section>
            <Text className="text-[13px] text-[#999] m-0">
              Se você não criou uma conta, ignore este e-mail.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
