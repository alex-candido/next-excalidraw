import { AppProviders } from "@/providers/app";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
