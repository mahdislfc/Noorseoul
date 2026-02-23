import { redirect } from "next/navigation";
import { AdminProducts } from "@/components/admin/AdminProducts";
import {
  getAdminSessionCookie,
  isAdminEnvConfigured,
  isAdminSessionValid,
} from "@/lib/admin-auth";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isAdminEnvConfigured()) {
    redirect(`/${locale}/admin/login`);
  }

  const session = await getAdminSessionCookie();
  if (!isAdminSessionValid(session)) {
    redirect(`/${locale}/admin/login`);
  }

  return <AdminProducts locale={locale} />;
}
