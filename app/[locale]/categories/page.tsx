
import { Link } from '@/i18n/routing';

type Category = {
    name: string
    nameFa: string
    subcategories: Array<{ name: string, nameFa: string }>
}

const categories: Category[] = [
    {
        name: "Skincare",
        nameFa: "مراقبت پوست",
        subcategories: [
            { name: "Skin/toner", nameFa: "پوست/تونر" },
            { name: "Essence/Serum/Ampoule", nameFa: "اسنس/سرم/آمپول" },
            { name: "cream", nameFa: "کرم" },
            { name: "lotion", nameFa: "لوسیون" },
            { name: "Mist/Oil", nameFa: "میست/روغن" },
            { name: "Skincare set", nameFa: "ست مراقبت پوست" },
            { name: "Skincare devices", nameFa: "دستگاه های مراقبت پوست" }
        ]
    },
    {
        name: "Mask pack",
        nameFa: "ماسک پک",
        subcategories: [
            { name: "sheet pack", nameFa: "ماسک ورقه ای" },
            { name: "pad", nameFa: "پد" },
            { name: "facial pack", nameFa: "ماسک صورت" },
            { name: "nose pack", nameFa: "ماسک بینی" },
            { name: "Patch", nameFa: "پچ" }
        ]
    },
    {
        name: "Cleansing",
        nameFa: "پاکسازی",
        subcategories: [
            { name: "Cleansing foam/gel", nameFa: "فوم/ژل پاک کننده" },
            { name: "Oil/Night", nameFa: "روغن پاک کننده/نایت" },
            { name: "Water/Milk", nameFa: "واتر/شیر پاک کن" },
            { name: "Peeling & Scrub", nameFa: "لایه بردار و اسکراب" },
            { name: "tissue/pad", nameFa: "دستمال/پد" },
            { name: "Lip & Eye Remover", nameFa: "پاک کننده چشم و لب" },
            { name: "cleansing device", nameFa: "دستگاه پاکسازی" }
        ]
    },
    {
        name: "Sun care",
        nameFa: "مراقبت آفتاب",
        subcategories: [
            { name: "sunscreen", nameFa: "ضد آفتاب" },
            { name: "Sun serum", nameFa: "سرم ضد آفتاب" },
            { name: "sun stick", nameFa: "استیک ضد آفتاب" },
            { name: "Sun cushion", nameFa: "کوشن ضد آفتاب" },
            { name: "Sun spray/sun patch", nameFa: "اسپری/پچ ضد آفتاب" },
            { name: "Tanning/Aftersun", nameFa: "برنزه/بعد از آفتاب" }
        ]
    },
    {
        name: "Makeup",
        nameFa: "آرایش",
        subcategories: [
            { name: "Lip makeup", nameFa: "آرایش لب" },
            { name: "Base makeup", nameFa: "آرایش پایه" },
            { name: "eye makeup", nameFa: "آرایش چشم" }
        ]
    },
    {
        name: "Makeup tools",
        nameFa: "ابزار آرایش",
        subcategories: [
            { name: "makeup tools", nameFa: "ابزار آرایشی" },
            { name: "eyelash tool", nameFa: "ابزار مژه" },
            { name: "Face Tool", nameFa: "ابزار صورت" },
            { name: "Hair/Body Tools", nameFa: "ابزار مو/بدن" },
            { name: "Daily Tools", nameFa: "ابزار روزانه" }
        ]
    },
    {
        name: "Dermo Cosmetics",
        nameFa: "درمو کازمتیک",
        subcategories: [
            { name: "Skincare", nameFa: "مراقبت پوست" },
            { name: "Body care", nameFa: "مراقبت بدن" },
            { name: "Cleansing", nameFa: "پاکسازی" },
            { name: "Sun care", nameFa: "مراقبت آفتاب" },
            { name: "mask pack", nameFa: "ماسک پک" }
        ]
    },
    {
        name: "Men's care",
        nameFa: "مراقبت آقایان",
        subcategories: [
            { name: "Skincare", nameFa: "مراقبت پوست" },
            { name: "makeup", nameFa: "آرایش" },
            { name: "Shaving/Waxing", nameFa: "اصلاح/وکس" },
            { name: "Body care", nameFa: "مراقبت بدن" },
            { name: "Hair care", nameFa: "مراقبت مو" },
            { name: "Fragrance", nameFa: "عطر" },
            { name: "Fashion/Hobbies", nameFa: "مد/سرگرمی" },
            { name: "Health products/food", nameFa: "محصولات سلامت/غذا" }
        ]
    },
    {
        name: "Hair care",
        nameFa: "مراقبت مو",
        subcategories: [
            { name: "Shampoo/Rinse", nameFa: "شامپو/آبکشی" },
            { name: "Treatment/Pack", nameFa: "تریتمنت/پک" },
            { name: "Scalp ampoule/tonic", nameFa: "آمپول/تونیک پوست سر" },
            { name: "hair essence", nameFa: "اسنس مو" },
            { name: "Hair dye/perm", nameFa: "رنگ/فر مو" },
            { name: "Hair appliance/brush", nameFa: "ابزار/برس مو" },
            { name: "Styling", nameFa: "حالت دهنده" }
        ]
    },
    {
        name: "Body care",
        nameFa: "مراقبت بدن",
        subcategories: [
            { name: "Body lotion/cream", nameFa: "لوسیون/کرم بدن" },
            { name: "Oil/Mist", nameFa: "روغن/میست" },
            { name: "Hand care", nameFa: "مراقبت دست" },
            { name: "Foot care", nameFa: "مراقبت پا" },
            { name: "Shower/bathing", nameFa: "دوش/حمام" },
            { name: "Hair removal/waxing", nameFa: "مو زدایی/وکس" },
            { name: "Deodorant", nameFa: "دئودورانت" },
            { name: "Baby", nameFa: "کودک" }
        ]
    },
    {
        name: "Nail",
        nameFa: "ناخن",
        subcategories: [
            { name: "Regular nails", nameFa: "لاک معمولی" },
            { name: "gel nails", nameFa: "ژل ناخن" },
            { name: "Nail tips/stickers", nameFa: "تیپ/استیکر ناخن" }
        ]
    },
    {
        name: "Health food",
        nameFa: "غذای سلامت",
        subcategories: [
            { name: "vitamin", nameFa: "ویتامین" },
            { name: "nutritional supplements", nameFa: "مکمل های غذایی" },
            { name: "Lactic acid bacteria", nameFa: "باکتری های لاکتیک" },
            { name: "Slimming/Inner Beauty", nameFa: "لاغری/زیبایی درونی" }
        ]
    },
    {
        name: "Health/Health Products",
        nameFa: "سلامت/محصولات سلامت",
        subcategories: [
            { name: "Patch/Topical Care", nameFa: "پچ/مراقبت موضعی" },
            { name: "relaxation products", nameFa: "محصولات آرامش" },
            { name: "Life/Medical", nameFa: "زندگی/پزشکی" },
            { name: "Massage/Protection Belt", nameFa: "ماساژ/کمربند محافظ" },
            { name: "sports equipment", nameFa: "تجهیزات ورزشی" }
        ]
    },
    {
        name: "Oral care products",
        nameFa: "محصولات مراقبت دهان",
        subcategories: [
            { name: "toothbrush", nameFa: "مسواک" },
            { name: "toothpaste", nameFa: "خمیر دندان" },
            { name: "After-oral care", nameFa: "مراقبت پس از دهان" },
            { name: "portable set", nameFa: "ست قابل حمل" },
            { name: "Oral appliances", nameFa: "ابزار دهانی" }
        ]
    },
    {
        name: "Sanitary products",
        nameFa: "محصولات بهداشتی",
        subcategories: [
            { name: "Menstrual/Hygiene Products", nameFa: "محصولات قاعدگی/بهداشتی" },
            { name: "Y-Zone Care", nameFa: "مراقبت ناحیه Y" },
            { name: "adult products", nameFa: "محصولات بزرگسالان" },
            { name: "Massage gel/oil", nameFa: "ژل/روغن ماساژ" },
            { name: "Tester", nameFa: "تستر" },
            { name: "diaper", nameFa: "پوشک" },
            { name: "toilet paper", nameFa: "دستمال توالت" }
        ]
    }
];

export default async function CategoriesPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const isFa = locale === "fa"
    const title = isFa ? "همه دسته بندی ها" : "All Categories"
    const subtitle = isFa
        ? "مجموعه کامل محصولات زیبایی کره ای پریمیوم ما را بررسی کنید."
        : "Explore our comprehensive collection of premium Korean beauty products."

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-5xl mb-4 text-center">{title}</h1>
            <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
                {subtitle}
            </p>

            <div className="masonry-grid-cols-1 md:masonry-grid-cols-2 lg:masonry-grid-cols-3 xl:masonry-grid-cols-4 gap-8 columns-1 md:columns-2 lg:columns-3 xl:columns-4 space-y-8">
                {categories.map((category, index) => (
                    <div key={index} className="break-inside-avoid mb-8 bg-secondary/5 p-8 rounded-lg hover:bg-secondary/10 transition-colors">
                        <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                            <h2 className="font-serif text-2xl mb-6 hover:text-primary transition-colors inline-flex items-center gap-2 group cursor-pointer">
                                {isFa ? category.nameFa : category.name}
                                <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">→</span>
                            </h2>
                        </Link>
                        <ul className="space-y-3">
                            {category.subcategories.map((sub, subIndex) => (
                                <li key={subIndex}>
                                    <Link
                                        href={`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm hover:underline underline-offset-4"
                                    >
                                        {isFa ? sub.nameFa : sub.name}
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
