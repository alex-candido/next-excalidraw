"use client";

import dynamic from "next/dynamic";
import type { Excalidraw as ExcalidrawType } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

type ExcalidrawEditorProps = React.ComponentProps<typeof ExcalidrawType>;

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false, loading: () => <div className="size-full animate-pulse bg-muted" /> }
);

export function ExcalidrawEditor(props: ExcalidrawEditorProps) {
  return (
    <div className="size-full">
      <Excalidraw {...props} />
    </div>
  );
}
