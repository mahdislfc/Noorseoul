export interface Product {
  id: string;
  name: string;
  koreanName?: string | null;
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
  saleLabel?: string | null;
  promoBadgeText?: string | null;
  promoTooltipText?: string | null;
  promoPriority?: "high" | "none" | null;
  promoLastChecked?: string | null;
  miniCalendar?: {
    type: "mini_price_calendar";
    timezone: string;
    start_date: string;
    days: Array<{
      date: string;
      price: number;
      state: "sale" | "regular" | "sale_start" | "sale_end";
      label: "Sale" | "Ends" | "";
    }>;
    calendar_end_unknown: boolean;
    calendar_header: string;
    calendar_subheader: string;
    days_left: number | null;
  } | null;
  extractedRegularPriceText?: string | null;
  extractedSaleText?: string | null;
  extractedBestDealText?: string | null;
  sourceRegularPrice?: number | null;
  sourceCurrentPrice?: number | null;
  sourceCurrency?: string | null;
  sourceSaleStart?: string | null;
  sourceSaleEnd?: string | null;
  sourceSaleTimezone?: string | null;
  sourceDiscountAmount?: number | null;
  sourceDiscountPercent?: number | null;
  syncStatus?: "ok" | "warning" | "failed" | null;
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
