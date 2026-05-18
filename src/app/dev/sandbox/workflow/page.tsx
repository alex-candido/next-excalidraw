"use client"

import dynamic from "next/dynamic"

const WorkflowSandbox = dynamic(
  () => import("./workflow-sandbox").then((m) => m.WorkflowSandbox),
  { ssr: false },
)

export default function WorkflowSandboxPage() {
  return <WorkflowSandbox />
}
