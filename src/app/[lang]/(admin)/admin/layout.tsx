import { AdminProviders } from "@/providers/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
