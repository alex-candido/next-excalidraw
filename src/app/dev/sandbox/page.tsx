"use client"

import dynamic from "next/dynamic"

const SandboxContent = dynamic(
  () => import("./sandbox-content").then((m) => m.SandboxContent),
  { ssr: false },
)

export default function SandboxPage() {
  return <SandboxContent />
}
