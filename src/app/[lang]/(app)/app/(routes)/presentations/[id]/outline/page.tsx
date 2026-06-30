import { AppPresentationsOutline } from "@/components/app/presentations/outline/app-presentations-outline";

export default async function OutlinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AppPresentationsOutline presentationId={id} />;
}
