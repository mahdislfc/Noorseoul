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

  return (
    <div className="min-h-screen bg-background px-4 py-8 lg:px-8">
      <div className="mx-auto w-full max-w-[110rem]">{children}</div>
    </div>
  );
}
