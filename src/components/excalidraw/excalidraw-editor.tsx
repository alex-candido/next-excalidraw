"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import type { Excalidraw as ExcalidrawType } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

type ExcalidrawEditorProps = React.ComponentProps<typeof ExcalidrawType>;

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false, loading: () => <div className="size-full animate-pulse bg-muted" /> }
);

export function ExcalidrawEditor(props: ExcalidrawEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const theme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="size-full">
      <Excalidraw theme={theme} {...props} />
    </div>
  );
}
