import { ExcalidrawEditor } from "@/components/excalidraw/excalidraw-editor";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="h-screen w-full" data-presentation-id={id}>
      <ExcalidrawEditor />
    </div>
  );
}
