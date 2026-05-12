export default async function OutlinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>Outline — {id}</div>;
}
