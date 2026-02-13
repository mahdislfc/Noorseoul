import "server-only";
import { prisma } from "@/lib/prisma";
import type { Product as PrismaProduct } from "@prisma/client";
import type { Product } from "@/lib/types";

function toProductModel(product: PrismaProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    currency: product.currency,
    brand: product.brand,
    category: product.category,
    department: product.department,
    image: product.image,
    bestSeller: product.bestSeller,
    newArrival: product.newArrival,
    comingSoon: product.comingSoon,
    size: product.size,
    images: product.image ? [product.image] : [],
  };
}

export async function getProducts(_locale?: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductModel);
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({ where: { id } });
  return product ? toProductModel(product) : null;
}
