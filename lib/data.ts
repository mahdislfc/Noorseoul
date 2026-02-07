export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    currency: string;
    brand?: string;
    category: string; // This will map to "Subcategory" (e.g. Toner)
    department: string; // This will map to "Main Category" (e.g. Skincare)
    image: string;
    bestSeller: boolean;
    newArrival: boolean;
    comingSoon?: boolean;
}

export const products: { en: Product[], ar: Product[] } = {
    en: [
        {
            id: "1",
            name: "Golden Glow Serum",
            price: 125.00,
            originalPrice: 150.00,
            currency: "AED",
            brand: "Sulwhasoo",
            category: "Essence/Serum/Ampoule",
            department: "Skincare",
            image: "/images/products/serum.jpg",
            bestSeller: true,
            newArrival: false
        },
        {
            id: "2",
            name: "Desert Rose Night Cream",
            price: 95.00,
            currency: "AED",
            brand: "Laneige",
            category: "cream",
            department: "Skincare",
            image: "/images/products/cream.jpg",
            bestSeller: true,
            newArrival: true
        },
        {
            id: "3",
            name: "Saffron Infused Elixir",
            price: 148.00,
            originalPrice: 180.00,
            currency: "AED",
            brand: "COSRX",
            category: "Essence/Serum/Ampoule",
            department: "Skincare",
            image: "/images/products/elixir.jpg",
            bestSeller: false,
            newArrival: true
        },
        {
            id: "4",
            name: "Mineral Sun Defense",
            price: 68.00,
            currency: "AED",
            brand: "Innisfree",
            category: "sunscreen",
            department: "Sun care",
            image: "/images/products/sunscreen.jpg",
            bestSeller: true,
            newArrival: false
        },
        {
            id: "5",
            name: "Velvet Matte Lipstick",
            price: 85.00,
            originalPrice: 100.00,
            currency: "AED",
            brand: "Banila Co",
            category: "Lip makeup",
            department: "Makeup",
            image: "/images/products/lipstick.jpg",
            bestSeller: false,
            newArrival: true
        },
        {
            id: "6",
            name: "Luminous Cushion Foundation",
            price: 160.00,
            currency: "AED",
            brand: "Laneige",
            category: "Base makeup",
            department: "Makeup",
            image: "/images/products/foundation.jpg",
            bestSeller: true,
            newArrival: false
        },
        {
            id: "7",
            name: "Green Tea Cleansing Foam",
            price: 45.00,
            currency: "AED",
            brand: "Innisfree",
            category: "Cleansing foam/gel",
            department: "Cleansing",
            image: "https://placehold.co/600x600/e5e5e5/000?text=Cleanser",
            bestSeller: true,
            newArrival: false
        },
        {
            id: "8",
            name: "Silk Repair Shampoo",
            price: 110.00,
            currency: "AED",
            brand: "Mise en Scène",
            category: "Shampoo/Rinse",
            department: "Hair care",
            image: "https://placehold.co/600x600/e5e5e5/000?text=Shampoo",
            bestSeller: false,
            newArrival: true
        },
        {
            id: "9",
            name: "Daily Body Lotion",
            price: 75.00,
            currency: "AED",
            brand: "Illiyoon",
            category: "Body lotion/cream",
            department: "Body care",
            image: "https://placehold.co/600x600/e5e5e5/000?text=Body+Lotion",
            bestSeller: true,
            newArrival: false
        },
        {
            id: "10",
            name: "Collagen Gummy",
            price: 55.00,
            currency: "AED",
            brand: "Nature's Way",
            category: "nutritional supplements",
            department: "Health food",
            image: "https://placehold.co/600x600/e5e5e5/000?text=Collagen",
            bestSeller: false,
            newArrival: true
        },
        {
            id: "11",
            name: "Premium Gel Nail Sticker",
            price: 35.00,
            currency: "AED",
            brand: "Ohora",
            category: "Nail tips/stickers",
            department: "Nail",
            image: "https://placehold.co/600x600/e5e5e5/000?text=Nail+Sticker",
            bestSeller: true,
            newArrival: true
        },
        {
            id: "12",
            name: "Men's All-in-One Fluid",
            price: 89.00,
            currency: "AED",
            brand: "IOPE Men",
            category: "Skincare",
            department: "Men's care",
            image: "https://placehold.co/600x600/e5e5e5/000?text=Mens+Skincare",
            bestSeller: true,
            newArrival: false
        },
        {
            id: "13",
            name: "Revitalizing Eye Cream",
            price: 85.00,
            currency: "AED",
            brand: "Sulwhasoo",
            category: "Eye cream",
            department: "Skincare",
            image: "https://placehold.co/600x600/e5e5e5/000?text=Eye+Cream",
            bestSeller: false,
            newArrival: true
        },
        {
            id: "14",
            name: "Mystery Product (Coming Soon)",
            price: 0,
            currency: "AED",
            brand: "Banila Co",
            category: "Unknown",
            department: "Skincare",
            image: "https://placehold.co/600x600/000/fff?text=Coming+Soon",
            bestSeller: false,
            newArrival: false,
            comingSoon: true
        }
    ],
    ar: [
        {
            id: "1",
            name: "سيروم الإشراقة الذهبية",
            price: 125.00,
            originalPrice: 150.00,
            currency: "د.إ",
            brand: "Sulwhasoo",
            category: "Essence/Serum/Ampoule",
            department: "Skincare",
            image: "/images/products/serum.jpg",
            bestSeller: true,
            newArrival: false
        },
        {
            id: "2",
            name: "كريم ليلي ورد الصحراء",
            price: 95.00,
            currency: "د.إ",
            brand: "Laneige",
            category: "cream",
            department: "Skincare",
            image: "/images/products/cream.jpg",
            bestSeller: true,
            newArrival: true
        }
    ]
};

export function getProducts(locale: string = 'en') {
    return products[locale as keyof typeof products] || products.en;
}
