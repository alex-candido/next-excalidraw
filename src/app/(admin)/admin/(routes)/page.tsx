"use client";

import { useAdmin } from "@/providers/admin";

export default function AdminPage() {
  const { sidebarOpen, toggleSidebar } = useAdmin();

  return (
    <div>
      <h1>Admin</h1>
      <p>Sidebar: {sidebarOpen ? "open" : "closed"}</p>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
    </div>
  );
}
