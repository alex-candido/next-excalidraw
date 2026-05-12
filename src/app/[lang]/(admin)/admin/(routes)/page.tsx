import { redirect } from "next/navigation";

export default function AdminIndexPage({
  params,
}: {
  params: { lang: string };
}) {
  redirect(`/${params.lang}/admin/dashboard`);
}
