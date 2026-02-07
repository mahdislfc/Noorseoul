
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const categories = [
    {
        name: "Skincare",
        subcategories: [
            "Skin/toner", "Essence/Serum/Ampoule", "cream", "lotion", "Mist/Oil", "Skincare set", "Skincare devices"
        ]
    },
    {
        name: "Mask pack",
        subcategories: [
            "sheet pack", "pad", "facial pack", "nose pack", "Patch"
        ]
    },
    {
        name: "Cleansing",
        subcategories: [
            "Cleansing foam/gel", "Oil/Night", "Water/Milk", "Peeling & Scrub", "tissue/pad", "Lip & Eye Remover", "cleansing device"
        ]
    },
    {
        name: "Sun care",
        subcategories: [
            "sunscreen", "sun stick", "Sun cushion", "Sun spray/sun patch", "Tanning/Aftersun"
        ]
    },
    {
        name: "Makeup",
        subcategories: [
            "Lip makeup", "Base makeup", "eye makeup"
        ]
    },
    {
        name: "Makeup tools",
        subcategories: [
            "makeup tools", "eyelash tool", "Face Tool", "Hair/Body Tools", "Daily Tools"
        ]
    },
    {
        name: "Dermo Cosmetics",
        subcategories: [
            "Skincare", "Body care", "Cleansing", "Sun care", "mask pack"
        ]
    },
    {
        name: "Men's care",
        subcategories: [
            "Skincare", "makeup", "Shaving/Waxing", "Body care", "Hair care", "Fragrance", "Fashion/Hobbies", "Health products/food"
        ]
    },
    {
        name: "Hair care",
        subcategories: [
            "Shampoo/Rinse", "Treatment/Pack", "Scalp ampoule/tonic", "hair essence", "Hair dye/perm", "Hair appliance/brush", "Styling"
        ]
    },
    {
        name: "Body care",
        subcategories: [
            "Body lotion/cream", "Oil/Mist", "Hand care", "Foot care", "Shower/bathing", "Hair removal/waxing", "Deodorant", "Baby"
        ]
    },
    {
        name: "Nail",
        subcategories: [
            "Regular nails", "gel nails", "Nail tips/stickers"
        ]
    },
    {
        name: "Health food",
        subcategories: [
            "vitamin", "nutritional supplements", "Lactic acid bacteria", "Slimming/Inner Beauty"
        ]
    },
    {
        name: "Health/Health Products",
        subcategories: [
            "Patch/Topical Care", "relaxation products", "Life/Medical", "Massage/Protection Belt", "sports equipment"
        ]
    },
    {
        name: "Oral care products",
        subcategories: [
            "toothbrush", "toothpaste", "After-oral care", "portable set", "Oral appliances"
        ]
    },
    {
        name: "Sanitary products",
        subcategories: [
            "Menstrual/Hygiene Products", "Y-Zone Care", "adult products", "Massage gel/oil", "Tester", "diaper", "toilet paper"
        ]
    }
];

export default function CategoriesPage() {
    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-5xl mb-4 text-center">All Categories</h1>
            <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
                Explore our comprehensive collection of premium Korean beauty products.
            </p>

            <div className="masonry-grid-cols-1 md:masonry-grid-cols-2 lg:masonry-grid-cols-3 xl:masonry-grid-cols-4 gap-8 columns-1 md:columns-2 lg:columns-3 xl:columns-4 space-y-8">
                {categories.map((category, index) => (
                    <div key={index} className="break-inside-avoid mb-8 bg-secondary/5 p-8 rounded-lg hover:bg-secondary/10 transition-colors">
                        <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                            <h2 className="font-serif text-2xl mb-6 hover:text-primary transition-colors inline-flex items-center gap-2 group cursor-pointer">
                                {category.name}
                                <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">→</span>
                            </h2>
                        </Link>
                        <ul className="space-y-3">
                            {category.subcategories.map((sub, subIndex) => (
                                <li key={subIndex}>
                                    <Link
                                        href={`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub)}`}
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm hover:underline underline-offset-4"
                                    >
                                        {sub}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}
