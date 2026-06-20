import { PenLine } from "lucide-react";
import Link from "next/link";

export function AuthNavBrand() {
  return (
    <Link href="/landing/home" className="auth-nav-brand flex items-center gap-2 font-semibold text-sm">
      <PenLine className="size-5" />
      <span>Next Excalidraw</span>
    </Link>
  );
}
