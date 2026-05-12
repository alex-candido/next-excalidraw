export default async function PresentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>Present — {id}</div>;
}
