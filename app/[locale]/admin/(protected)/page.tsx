import { AdminProducts } from "@/components/admin/AdminProducts";

export default async function AdminPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  return <AdminProducts locale={locale} />;
}
