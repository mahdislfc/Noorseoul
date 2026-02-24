import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { SimilarProductsSection } from "@/components/product/SimilarProductsSection";
import { getProductById, getProductsByIds } from "@/lib/data";
import type { Product } from "@/lib/types";
import { getTranslations } from "next-intl/server";

function isAbortLikeError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message || "")
        : "";
  const normalized = message.toLowerCase();
  return (
    normalized.includes("signal is aborted without reason") ||
    normalized.includes("signal is aborted") ||
    normalized.includes("aborterror")
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("Product");
  let product: Product | null = null;
  try {
    product = await getProductById(id);
  } catch (error) {
    if (isAbortLikeError(error)) {
      notFound();
    }
    throw error;
  }

  if (!product) {
    notFound();
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const similarProductIds = product.similarProductIds || [];
  const bundleProductId = product.bundleProductId?.trim();
  const relatedIds = [
    ...(bundleProductId ? [bundleProductId] : []),
    ...similarProductIds,
  ].filter((relatedId) => relatedId && relatedId !== product.id);
  let relatedProducts: Product[] = [];
  try {
    relatedProducts = await getProductsByIds(relatedIds);
  } catch (error) {
    if (!isAbortLikeError(error)) {
      throw error;
    }
  }
  const relatedProductsById = new Map(
    relatedProducts.map((relatedProduct) => [relatedProduct.id, relatedProduct])
  );
  const bundleProduct = bundleProductId
    ? relatedProductsById.get(bundleProductId) || null
    : null;
  const similarProducts: Product[] = similarProductIds
    .map((similarId) => relatedProductsById.get(similarId))
    .filter((item): item is Product => Boolean(item));
  const localizedDescription =
    locale === "ar"
      ? (product.descriptionAr?.trim() || product.description?.trim() || "")
      : locale === "fa"
        ? (product.descriptionFa?.trim() || product.description?.trim() || "")
        : (product.description?.trim() || "");

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-6 lg:px-20 mb-8">
          <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-50">
            <span>{t("home")}</span>
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
                priceAed: product.priceAed ?? null,
                priceT: product.priceT ?? null,
                oldPrice: product.originalPrice ?? undefined,
                oldPriceAed: product.originalPriceAed ?? null,
                oldPriceT: product.originalPriceT ?? null,
                saleEndsAt: product.saleEndsAt ?? null,
                currency: product.currency,
                description: localizedDescription,
                ingredients: product.ingredients || "",
                skinType: product.skinType || "",
                scent: product.scent || "",
                waterResistance: product.waterResistance || "",
                bundleLabel: product.bundleLabel || "",
                bundleProductId: product.bundleProductId || "",
                economicalOption: product.economicalOption,
                colorShades: product.colorShades || [],
                bundleProduct: bundleProduct
                  ? {
                      id: bundleProduct.id,
                      name: bundleProduct.name,
                      price: bundleProduct.price,
                      currency: bundleProduct.currency,
                      size: bundleProduct.size || "",
                      image:
                        bundleProduct.images && bundleProduct.images.length > 0
                          ? bundleProduct.images[0]
                          : bundleProduct.image,
                    }
                  : undefined,
                images,
              }}
            />
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 mt-12">
          <SimilarProductsSection products={similarProducts} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
