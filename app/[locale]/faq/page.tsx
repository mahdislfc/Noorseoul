
import { ChevronDown } from "lucide-react"

interface FAQPageProps {
    params: Promise<{
        locale: string
    }>
}

const FAQ_ITEMS = {
    en: [
        {
            question: "Are the products on Noor Seoul 100% authentic?",
            answer:
                "Whenever you are shopping with Noor Seoul, you can be assured that you are always getting authentic and genuine products that are exported directly from SOUTH KOREA. All products are bought from the official brands directly in original packages, sealed.",
        },
        {
            question: "How long does shipping take?",
            answer:
                "Orders are usually processed within 1 to 2 business days. Delivery timing depends on destination and courier operations, but approximately takes 7 to 13 business days.",
        },
        {
            question: "Can I change my order after placing it?",
            answer: "Please contact us immediately after placing your order. We will try to help, but changes cannot be guaranteed.",
        },
        {
            question: "Are products refundable?",
            answer: "Due to hygiene and safety regulations, cosmetic products are non-returnable and non-refundable.",
        },
    ],
    ar: [
        {
            question: "هل منتجات نور سيول أصلية 100%؟",
            answer:
                "عند التسوق من نور سيول، يمكنكِ التأكد أنكِ تحصلين دائمًا على منتجات أصلية وحقيقية يتم تصديرها مباشرة من كوريا الجنوبية. جميع المنتجات يتم شراؤها مباشرة من العلامات الرسمية وبعبوات أصلية مختومة.",
        },
        {
            question: "كم يستغرق الشحن؟",
            answer:
                "عادة يتم تجهيز الطلب خلال 1 إلى 2 يوم عمل. مدة التوصيل تعتمد على الوجهة وشركة الشحن، ولكنها تستغرق تقريبًا من 7 إلى 13 يوم عمل.",
        },
        {
            question: "هل يمكن تعديل الطلب بعد إتمامه؟",
            answer: "يرجى التواصل معنا فوراً بعد إتمام الطلب. سنحاول المساعدة، لكن لا يمكن ضمان التعديل.",
        },
        {
            question: "هل المنتجات قابلة للاسترجاع؟",
            answer: "بسبب لوائح النظافة والسلامة، منتجات التجميل غير قابلة للإرجاع أو الاسترداد.",
        },
    ],
    fa: [
        {
            question: "آیا محصولات نور سئول 100٪ اصل هستند؟",
            answer:
                "وقتی از نور سئول خرید می کنید، می توانید مطمئن باشید که همیشه محصولات اصل و اورجینال دریافت می کنید که مستقیما از کره جنوبی ارسال می شوند. تمام محصولات مستقیما از برندهای رسمی، در بسته بندی اصلی و پلمپ شده خریداری می شوند.",
        },
        {
            question: "ارسال چقدر زمان می برد؟",
            answer:
                "سفارش ها معمولا طی 1 تا 2 روز کاری پردازش می شوند. زمان تحویل به مقصد و شرکت حمل بستگی دارد، اما به طور تقریبی 7 تا 13 روز کاری زمان می برد.",
        },
        {
            question: "آیا بعد از ثبت سفارش می توان آن را تغییر داد؟",
            answer: "لطفا بلافاصله بعد از ثبت سفارش با ما تماس بگیرید. تلاش می کنیم کمک کنیم اما تغییرات تضمین نمی شود.",
        },
        {
            question: "آیا محصولات قابل مرجوعی هستند؟",
            answer: "به دلیل مقررات بهداشت و ایمنی، محصولات آرایشی و بهداشتی غیرقابل مرجوعی و غیرقابل بازپرداخت هستند.",
        },
    ],
} as const

export default async function FAQPage({ params }: FAQPageProps) {
    const { locale } = await params
    const isArabic = locale === "ar"
    const isPersian = locale === "fa"
    const copy = isArabic
        ? {
            title: "الأسئلة الشائعة",
            subtitle: "اضغطي على أي سؤال لعرض الإجابة.",
        }
        : isPersian
            ? {
                title: "سوالات متداول",
                subtitle: "برای مشاهده پاسخ، روی هر سوال کلیک کنید.",
            }
            : {
                title: "Frequently Asked Questions",
                subtitle: "Click any question to view its answer.",
            }

    const items = FAQ_ITEMS[locale as keyof typeof FAQ_ITEMS] || FAQ_ITEMS.en

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <div className="mx-auto max-w-4xl">
                <h1 className="font-serif text-4xl md:text-5xl text-center">{copy.title}</h1>
                <p className="text-muted-foreground text-center mt-4 mb-10">{copy.subtitle}</p>

                <div className="space-y-4">
                    {items.map((item, index) => (
                        <details
                            key={index}
                            className="group rounded-2xl border bg-white p-0 shadow-sm open:shadow-md transition-all"
                        >
                            <summary className="list-none cursor-pointer px-6 py-5 flex items-start justify-between gap-4">
                                <span className="text-lg font-semibold leading-snug">{item.question}</span>
                                <ChevronDown className="mt-1 h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="px-6 pb-6 -mt-1">
                                <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    )
}
