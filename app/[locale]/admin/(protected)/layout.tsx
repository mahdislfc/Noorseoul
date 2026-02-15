import { redirect } from "next/navigation";
import {
  getAdminSessionCookie,
  isAdminEnvConfigured,
  isAdminSessionValid,
} from "@/lib/admin-auth";

export default async function AdminProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!isAdminEnvConfigured()) {
    redirect(`/${locale}/admin/login`);
  }

  const session = await getAdminSessionCookie();
  if (!isAdminSessionValid(session)) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
