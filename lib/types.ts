export interface Product {
  id: string;
  name: string;
  description?: string | null;
  descriptionAr?: string | null;
  descriptionFa?: string | null;
  priceAed?: number | null;
  priceT?: number | null;
  price: number;
  originalPrice?: number | null;
  originalPriceAed?: number | null;
  originalPriceT?: number | null;
  currency: string;
  brand: string;
  category: string;
  department: string;
  image: string;
  bestSeller: boolean;
  newArrival: boolean;
  comingSoon?: boolean | null;
  size?: string | null;
  images?: string[];
  ingredients?: string | null;
  skinType?: string | null;
  scent?: string | null;
  waterResistance?: string | null;
  sourceUrl?: string | null;
  sourcePriceCurrency?: string | null;
  saleEndsAt?: string | null;
  sourceLastSyncedAt?: string | null;
  sourceSyncError?: string | null;
  bundleLabel?: string | null;
  bundleProductId?: string | null;
  similarProductIds?: string[];
  economicalOption?: {
    name: string;
    price: number;
    quantity?: number;
  };
  colorShades?: Array<{
    id: string;
    name: string;
    price: number;
    priceAed?: number | null;
    priceT?: number | null;
  }>;
}

export type AdminOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface AdminOrderItem {
  id: string;
  productId?: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerEmail: string;
  firstName: string;
  lastName: string;
  city: string;
  orderNote?: string | null;
  currency: string;
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  status: AdminOrderStatus;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

export interface RequestedProduct {
  id: string;
  name: string;
  image: string;
  note?: string | null;
  productUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
