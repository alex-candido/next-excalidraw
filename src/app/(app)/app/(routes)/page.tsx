"use client";

import { useApp } from "@/providers/app";

export default function AppPage() {
  const { sidebarOpen, toggleSidebar } = useApp();

  return (
    <div>
      <h1>App</h1>
      <p>Sidebar: {sidebarOpen ? "open" : "closed"}</p>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
    </div>
  );
}
