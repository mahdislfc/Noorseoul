export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
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
  bundleLabel?: string | null;
  bundleProductId?: string | null;
  economicalOption?: {
    name: string;
    price: number;
  };
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
  createdAt: string;
  updatedAt: string;
}
