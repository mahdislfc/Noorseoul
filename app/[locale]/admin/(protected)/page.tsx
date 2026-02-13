import { AdminProducts } from "@/components/admin/AdminProducts";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminProducts locale={locale} />;
}
