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
  economicalOption?: {
    name: string;
    price: number;
  };
}
