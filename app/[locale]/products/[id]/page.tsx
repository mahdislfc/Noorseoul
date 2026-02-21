import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { getProductById } from "@/lib/data";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-6 lg:px-20 mb-8">
          <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-50">
            <span>Home</span>
            <span>/</span>
            <span>{product.department}</span>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>

        <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7">
            <ProductGallery images={images} />
          </div>
          <div className="lg:col-span-5">
            <ProductInfo
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                oldPrice: product.originalPrice ?? undefined,
                currency: product.currency,
                description: product.description?.trim() || "",
                ingredients: product.ingredients || "",
                skinType: product.skinType || "",
                scent: product.scent || "",
                waterResistance: product.waterResistance || "",
                bundleLabel: product.bundleLabel || "",
                bundleProductId: product.bundleProductId || "",
                images,
              }}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
