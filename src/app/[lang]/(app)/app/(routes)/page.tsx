import { redirect } from "next/navigation";

export default function AppIndexPage({
  params,
}: {
  params: { lang: string };
}) {
  redirect(`/${params.lang}/app/dashboard`);
}
