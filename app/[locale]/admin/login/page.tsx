import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import {
  getAdminSessionCookie,
  isAdminEnvConfigured,
  isAdminSessionValid,
} from "@/lib/admin-auth";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAdminSessionCookie();
  if (isAdminSessionValid(session)) {
    redirect(`/${locale}/admin`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-serif mb-2">Admin Login</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to manage products.
        </p>

        {!isAdminEnvConfigured() ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Admin credentials are not configured. Set ADMIN_EMAIL and
            ADMIN_PASSWORD in your environment.
          </div>
        ) : (
          <AdminLoginForm locale={locale} />
        )}
      </div>
    </div>
  );
}
