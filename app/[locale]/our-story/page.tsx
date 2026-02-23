
export default async function OurStoryPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const isArabic = locale === "ar"
    const isFarsi = locale === "fa"

    const copy = isArabic
        ? {
            title: "قصتنا",
            subtitle: "اكتشفي كيف بدأت نور سيول، ولماذا نهتم كثيراً بإيصال منتجات الجمال الأصلية إلى كل بيت.",
            paragraphs: [
                "نور سيول هي شركة إعادة بيع مقرها سيول في كوريا الجنوبية. نقوم باختيار منتجاتنا بعناية من العلامات الكورية الموثوقة والمحبوبة، ثم نوصلها إلى عملائنا في أنحاء الشرق الأوسط.",
                "نؤمن أن الجمال يجب أن يكون صادقاً وسهل الوصول وشفافاً. لذلك نقدم نفس الأسعار المعروضة على موقعنا. نحن نشتري مباشرة من المواقع الرسمية للعلامات، ليكون تسوقك معنا بثقة وراحة بال.",
                "بدأت رحلتنا منذ سنوات في كوريا الجنوبية وشرق آسيا. ومع نمونا، كنا نسمع نفس القلق من عملائنا في الشرق الأوسط: العثور على منتجات أصلية كان صعباً، والطلب من الخارج كان يبدو معقداً ومحفوفاً بالقلق.",
                "رئيسة قسم الشرق الأوسط لدينا من إيران، وقد عاشت هذه التجربة بنفسها. قبل انتقالها إلى سيول، كانت تعرف جيداً مدى صعوبة العثور على منتجات أصلية محلياً. وحتى عند توفر خيارات دولية، كانت مخاوف الشحن والاستلام تجعل الشراء عبر الإنترنت مرهقاً.",
                "بعد انتقالها إلى سيول، أصبحت رؤيتها واضحة: يجب أن يتمكن عملاء الشرق الأوسط من شراء المنتجات الأصلية بسهولة، تماماً كما يفعل العملاء الكوريون داخل كوريا. كانت تؤمن بإزالة العوائق وبناء الثقة وجعل منتجات الجمال عالية الجودة متاحة للجميع.",
                "ومن هذه الرؤية وُلدت نور سيول. واليوم نواصل النمو بوعد بسيط: منتجات أصلية، أسعار عادلة، ودعم لطيف من فريقنا إلى عائلتك."
            ]
        }
        : isFarsi
            ? {
                title: "داستان ما",
                subtitle: "ببینید نور سئول چگونه شکل گرفت و چرا با تمام دل برای رساندن محصولات اصل به خانه های شما تلاش می کند.",
                paragraphs: [
                    "نور سئول یک فروشنده بازفروش مستقر در سئول کره جنوبی است. ما محصولات را با دقت از بهترین و معتبرترین برندهای کره ای تهیه می کنیم و برای مشتریان خود در خاورمیانه ارسال می کنیم.",
                    "باور ما این است که زیبایی باید شفاف، قابل دسترس و قابل اعتماد باشد. به همین دلیل قیمت هایی که در سایت می بینید واقعی و دقیق هستند. ما مستقیما از وبسایت رسمی برندها خرید می کنیم تا شما با خیال راحت خرید کنید.",
                    "ما سال ها پیش فروش را از کره جنوبی و شرق آسیا شروع کردیم. با گذر زمان متوجه شدیم که مشتریان خاورمیانه با یک مشکل مشترک روبه رو هستند: پیدا کردن محصول اصل سخت است و خرید از خارج همیشه با نگرانی ارسال و تحویل همراه است.",
                    "مدیر بخش خاورمیانه ما اهل ایران است و این چالش را کاملا از نزدیک تجربه کرده است. پیش از مهاجرت به سئول، همیشه پیدا کردن محصول اورجینال برایش سخت بود و حتی خرید آنلاین خارجی هم به خاطر نگرانی از ارسال و دریافت کالا استرس آور بود.",
                    "بعد از آمدن به سئول، یک هدف روشن داشت: مردم خاورمیانه باید بتوانند به همان راحتی مردم کره، محصولات اصل را تهیه کنند. او با جدیت روی گسترش فروش در خاورمیانه تاکید کرد تا این مسیر برای همه ساده تر و امن تر شود.",
                    "نور سئول از همین دیدگاه متولد شد. امروز هم با یک قول ساده کنار شما هستیم: محصولات اصل، قیمت منصفانه و پشتیبانی مهربان."
                ]
            }
            : {
                title: "Our Story",
                subtitle: "Discover how Noor Seoul began, and why we care so deeply about bringing genuine beauty to every home.",
                paragraphs: [
                    "Noor Seoul is a reseller based in Seoul, South Korea. We carefully shop from trusted and loved Korean beauty brands, then deliver to customers across the Middle East.",
                    "We believe beauty should be honest, accessible, and transparent. That is why we offer the exact prices shown on our website. We purchase directly from official brand websites, so our customers can shop with confidence and peace of mind.",
                    "Our journey started years ago in South Korea and East Asia. As we grew, we kept hearing the same concern from people in the Middle East: finding genuine products was difficult, and ordering from abroad felt risky and complicated.",
                    "Our Middle East department head, who is from Iran, understood this personally. Before moving to Seoul, she knew how hard it was to find authentic products locally. Even when international options existed, shipping and delivery uncertainty made online shopping stressful.",
                    "After relocating to Seoul, she had a clear vision: Middle Eastern customers should be able to buy real products as easily as Korean customers do in South Korea. She strongly believed in removing barriers, building trust, and making quality beauty available to everyone.",
                    "That vision became Noor Seoul. Today, we continue to grow with one simple promise: genuine products, fair pricing, and kind support from our team to yours."
                ]
            }

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">{copy.title}</h1>
            <div className="max-w-3xl mx-auto prose prose-lg">
                <p className="text-muted-foreground text-center">
                    {copy.subtitle}
                </p>
                <div className="mt-8 space-y-5 text-foreground/90 leading-relaxed">
                    {copy.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </div>
    )
}
