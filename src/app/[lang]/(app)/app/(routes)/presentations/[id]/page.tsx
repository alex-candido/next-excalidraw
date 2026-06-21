import { redirect } from "@/i18n/navigation";

export default async function PresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/app/presentations/${id}/editor`);
}
