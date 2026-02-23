import { getBrandsWithProductCounts } from "@/lib/data";
import { Link } from "@/i18n/routing";

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const isFarsi = locale === "fa";
  const brands = await getBrandsWithProductCounts();

  const copy = isArabic
    ? {
        title: "جميع العلامات التجارية",
        subtitle:
          "استعرضي جميع العلامات التي نعمل معها. سيتم تحديث هذه الصفحة باستمرار مع إضافة العلامات الجديدة.",
        note: "يتم ترتيب العلامات أبجدياً حسب الأسماء الإنجليزية.",
        sortedBy: "ترتيب أبجدي (A-Z)",
        noBrands: "لا توجد علامات متاحة حالياً."
      }
    : isFarsi
      ? {
          title: "همه برندها",
          subtitle:
            "تمام برندهایی که با آن ها همکاری می کنیم را اینجا ببینید. این صفحه به صورت مداوم با برندهای جدید به روز می شود.",
          note: "برندها بر اساس ترتیب الفبایی انگلیسی مرتب شده اند.",
          sortedBy: "مرتب سازی الفبایی (A-Z)",
          noBrands: "در حال حاضر برندی موجود نیست."
        }
      : {
          title: "All Brands",
          subtitle:
            "Browse every brand we work with. This page will be updated regularly as new brands are added.",
          note: "Brands are sorted alphabetically in English.",
          sortedBy: "Alphabetical (A-Z)",
          noBrands: "No brands are available yet."
        };

  return (
    <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
      <h1 className="font-serif text-4xl md:text-5xl mb-6 text-center">{copy.title}</h1>
      <p className="text-muted-foreground text-center max-w-3xl mx-auto text-lg">{copy.subtitle}</p>
      <div className="mt-10 max-w-4xl mx-auto rounded-xl border border-border bg-secondary/10 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-5">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">{copy.sortedBy}</p>
          <p className="text-xs text-muted-foreground">{copy.note}</p>
        </div>
        {brands.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{copy.noBrands}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {brands.map((entry) => (
              <Link
                key={entry.brand}
                href={`/products?brand=${encodeURIComponent(entry.brand)}`}
                className="rounded-lg border border-border bg-background px-4 py-3 flex items-center justify-between transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="text-sm font-semibold">{entry.brand}</span>
                <span className="text-xs text-muted-foreground">{entry.count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
