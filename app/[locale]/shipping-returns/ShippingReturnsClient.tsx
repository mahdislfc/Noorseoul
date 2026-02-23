"use client"

import { useMemo } from "react"
import { useDisplayCurrency } from "@/context/DisplayCurrencyContext"

type Props = {
    locale: string
}

const USD_TO_AED = 3.67
const USD_TO_TOMAN = 160000

function formatMoney(amountUsd: number, currency: "USD" | "AED" | "T", locale: string) {
    const value =
        currency === "AED"
            ? amountUsd * USD_TO_AED
            : currency === "T"
                ? amountUsd * USD_TO_TOMAN
                : amountUsd
    const formatterLocale = locale === "ar" ? "ar-AE" : locale === "fa" ? "fa-IR" : "en-US"
    if (currency === "T") {
        const formatted = new Intl.NumberFormat(formatterLocale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value)
        return `${formatted} T`
    }
    return new Intl.NumberFormat(formatterLocale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value)
}

export function ShippingReturnsClient({ locale }: Props) {
    const isArabic = locale === "ar"
    const isPersian = locale === "fa"
    const { currency, setCurrency, allowedCurrencies } = useDisplayCurrency()

    const amounts = useMemo(() => {
        return {
            lowThreshold: formatMoney(100, currency, locale),
            midThreshold: formatMoney(200, currency, locale),
            highThreshold: formatMoney(250, currency, locale),
            lowFee: formatMoney(10, currency, locale),
            midFee: formatMoney(18, currency, locale),
            highFee: formatMoney(20, currency, locale),
            topFee: formatMoney(25, currency, locale)
        }
    }, [currency, locale])

    const copy = isArabic
        ? {
            title: "الشحن والاسترجاع",
            subtitle: "شكرًا لتسوقكم مع نور سيول. يرجى الاطلاع على سياسة الشحن والاسترجاع أدناه.",
            currencyLabel: "العملة",
            shippingTitle: "رسوم الشحن",
            shippingIntro: "يتم احتساب رسوم الشحن حسب إجمالي الطلب قبل الشحن:",
            shippingLine1: `الطلبات الأقل من ${amounts.lowThreshold}: رسوم شحن ${amounts.lowFee}`,
            shippingLine2: `الطلبات من ${amounts.lowThreshold} إلى ${amounts.midThreshold}: رسوم شحن ${amounts.midFee}`,
            shippingLine3: `الطلبات الأعلى من ${amounts.midThreshold} وحتى ${amounts.highThreshold}: رسوم شحن ${amounts.highFee}`,
            shippingLine4: `الطلبات الأعلى من ${amounts.highThreshold}: رسوم شحن ${amounts.topFee}`,
            shippingNote: "تظهر رسوم الشحن بوضوح في صفحة الدفع قبل إتمام عملية الشراء.",
            conversionNote:
                currency === "AED"
                    ? "تم عرض الأسعار بالدرهم الإماراتي."
                    : currency === "T"
                        ? "تم عرض الأسعار بالتومان."
                        : "Prices are shown in USD.",
            processingTitle: "تجهيز الطلب والتوصيل",
            processing1: "عادة يتم تجهيز الطلب خلال 1 إلى 2 يوم عمل.",
            processing2: "قد تختلف مدة التوصيل حسب المنطقة وشركة الشحن وفترات الضغط الموسمية.",
            processing3: "بعد شحن الطلب، سيتم تزويدكم بمعلومات التتبع لمتابعة الشحنة.",
            processing4:
                "إذا رغبتِ في استلام طلبك أسرع من الوقت التقديري، يرجى التواصل معنا لطلب الشحن السريع مقابل رسوم إضافية (سيتم إضافة رقم التواصل لاحقاً).",
            returnsTitle: "الاسترجاع واسترداد المبلغ",
            returns1: "في حال وجود أي مشكلة في الطلب، يرجى التواصل مع فريق الدعم في أقرب وقت ممكن.",
            returns2: "للنظر في طلب الاسترجاع، يجب أن تكون المنتجات غير مستخدمة وبحالتهـا الأصلية ومع التغليف الأصلي.",
            returns3: "يتم رد المبالغ المعتمدة إلى وسيلة الدفع الأصلية، وقد تختلف مدة ظهور المبلغ حسب مزود الدفع.",
            rewardTitle: "مكافأة الشحن المجاني",
            reward1: "نوفر مكافأة الشحن المجاني ضمن برنامج الجواهر.",
            reward2: "يمكن استبدال هذه المكافأة عند الوصول إلى 400 جوهرة.",
            reward3: "بعد الاستبدال، يمكن استخدام الشحن المجاني في عملية الشراء التالية المؤهلة وفق الرصيد النشط واستخدام الكود.",
            policyLine1:
                "جميع أوقات الشحن والتسليم تقديرية وليست مضمونة. نور سيول غير مسؤولة عن أي تأخير ناتج عن عوامل خارج نطاق سيطرتها مثل إجراءات الجمارك أو مشكلات شركات الشحن أو الأحوال الجوية أو حالات القوة القاهرة.",
            policyLine2:
                "رسوم الشحن غير قابلة للاسترداد ما لم توافق نور سيول صراحة على خلاف ذلك.",
            policyLine3:
                "يتم شحن الطلبات فقط إلى العنوان الذي يقدمه العميل عند إتمام الدفع. العميل مسؤول عن التأكد من دقة عنوان التسليم.",
            customsTitle: "الجمارك والرسوم والضرائب",
            customs1:
                "يتحمل العملاء وحدهم مسؤولية أي رسوم جمركية أو رسوم استيراد أو ضرائب أو أي تكاليف أخرى مطلوبة في بلدهم.",
            customs2:
                "أي تأخير ناتج عن التخليص الجمركي خارج عن سيطرة نور سيول ولا يؤهل للاسترداد أو الإلغاء.",
            lostTitle: "الشحنات المفقودة أو المتضررة",
            lost1:
                "نور سيول غير مسؤولة عن الطرود المفقودة أو المتضررة أثناء النقل. ومع ذلك، سنقوم بالمساعدة في تقديم مطالبة لدى شركة الشحن للشحنات المفقودة أو المتضررة.",
            lost2:
                "يجب على العملاء الإبلاغ عن العناصر المتضررة أو المفقودة خلال 48 ساعة من استلام الطلب. قد يُطلب تقديم مستندات داعمة مثل صور الضرر.",
            changesTitle: "التعديلات والإلغاء",
            changes1:
                "لا يمكن تعديل الطلبات أو إلغاؤها أو استردادها بعد شحنها.",
            changes2:
                "إذا رغبتِ في إلغاء الطلب أو تعديله، يرجى التواصل معنا فورًا بعد إتمام الطلب. سنبذل قصارى جهدنا لتلبية الطلب، لكن لا يمكننا ضمان إجراء التعديلات.",
            nonReturnableTitle: "المنتجات غير القابلة للإرجاع",
            nonReturnable1:
                "جميع مستحضرات التجميل المباعة من نور سيول غير قابلة للإرجاع أو الاسترداد بسبب لوائح النظافة والسلامة."
        }
        : isPersian
            ? {
                title: "ارسال و مرجوعی",
                subtitle: "از خرید شما در نور سئول سپاسگزاریم. لطفا سیاست ارسال و مرجوعی را مطالعه کنید.",
                currencyLabel: "واحد پول",
                shippingTitle: "هزینه ارسال",
                shippingIntro: "هزینه ارسال بر اساس مبلغ سفارش پیش از هزینه ارسال محاسبه می شود:",
                shippingLine1: `سفارش های کمتر از ${amounts.lowThreshold}: هزینه ارسال ${amounts.lowFee}`,
                shippingLine2: `سفارش های ${amounts.lowThreshold} تا ${amounts.midThreshold}: هزینه ارسال ${amounts.midFee}`,
                shippingLine3: `سفارش های بالاتر از ${amounts.midThreshold} تا ${amounts.highThreshold}: هزینه ارسال ${amounts.highFee}`,
                shippingLine4: `سفارش های بالاتر از ${amounts.highThreshold}: هزینه ارسال ${amounts.topFee}`,
                shippingNote: "هزینه ارسال پیش از نهایی کردن پرداخت در صفحه تسویه حساب نمایش داده می شود.",
                conversionNote:
                    currency === "AED"
                        ? "قیمت ها به درهم امارات نمایش داده می شوند."
                        : currency === "T"
                            ? "قیمت ها به تومان نمایش داده می شوند."
                            : "قیمت ها به دلار آمریکا نمایش داده می شوند.",
                processingTitle: "پردازش و تحویل",
                processing1: "سفارش ها معمولا طی 1 تا 2 روز کاری پردازش می شوند.",
                processing2: "زمان تحویل ممکن است بر اساس موقعیت شما، عملکرد شرکت حمل و دوره های پرترافیک متفاوت باشد.",
                processing3: "پس از ارسال سفارش، اطلاعات رهگیری برای شما ارسال می شود.",
                processing4:
                    "اگر می خواهید سفارش خود را زودتر از زمان تخمینی دریافت کنید، برای ارسال اکسپرس با هزینه اضافی با ما تماس بگیرید (شماره تماس بعدا اضافه می شود).",
                returnsTitle: "مرجوعی و بازپرداخت",
                returns1: "در صورت وجود هرگونه مشکل در سفارش، لطفا در سریع ترین زمان با تیم پشتیبانی تماس بگیرید.",
                returns2: "برای بررسی مرجوعی، کالا باید استفاده نشده، در وضعیت اولیه و با بسته بندی اصلی باشد.",
                returns3: "بازپرداخت تاییدشده به روش پرداخت اصلی انجام می شود و زمان آن بسته به درگاه پرداخت متفاوت است.",
                rewardTitle: "پاداش ارسال رایگان",
                reward1: "پاداش ارسال رایگان در برنامه Gems ارائه می شود.",
                reward2: "این پاداش با 400 Gem قابل دریافت است.",
                reward3: "پس از دریافت، ارسال رایگان برای اولین تسویه حساب واجد شرایط بعدی شما اعمال می شود.",
                policyLine1:
                    "تمام زمان بندی های ارسال و تحویل تقریبی هستند و تضمین نمی شوند. نور سئول مسئول تاخیرهای ناشی از عوامل خارج از کنترل خود مانند فرآیندهای گمرکی، مشکلات شرکت حمل، شرایط آب و هوایی یا فورس ماژور نیست.",
                policyLine2:
                    "هزینه های ارسال غیرقابل استرداد هستند مگر اینکه نور سئول صراحتا با آن موافقت کند.",
                policyLine3:
                    "سفارش ها فقط به آدرسی که مشتری هنگام تسویه حساب ثبت کرده ارسال می شوند. مسئولیت صحت آدرس تحویل بر عهده مشتری است.",
                customsTitle: "گمرک، عوارض و مالیات",
                customs1:
                    "مسئولیت هرگونه هزینه گمرکی، عوارض واردات، مالیات یا سایر هزینه های الزامی کشور مقصد صرفا بر عهده مشتری است.",
                customs2:
                    "تاخیرهای ناشی از ترخیص گمرکی خارج از کنترل نور سئول است و شامل بازپرداخت یا لغو سفارش نمی شود.",
                lostTitle: "مرسوله های مفقود یا آسیب دیده",
                lost1:
                    "نور سئول مسئول بسته های مفقود یا آسیب دیده در حین حمل نیست. با این حال، ما در ثبت درخواست خسارت نزد شرکت حمل برای مرسوله های مفقود یا آسیب دیده همکاری می کنیم.",
                lost2:
                    "مشتریان باید حداکثر تا 48 ساعت پس از دریافت سفارش، موارد آسیب دیده یا کسری را گزارش کنند. ممکن است مدارک پشتیبان مانند عکس آسیب لازم باشد.",
                changesTitle: "تغییرات و لغو سفارش",
                changes1:
                    "پس از ارسال سفارش، امکان تغییر، لغو یا بازپرداخت وجود ندارد.",
                changes2:
                    "اگر قصد لغو یا اصلاح سفارش خود را دارید، بلافاصله پس از ثبت سفارش با ما تماس بگیرید. ما تمام تلاش خود را برای همکاری انجام می دهیم، اما اعمال تغییرات قابل تضمین نیست.",
                nonReturnableTitle: "کالاهای غیرقابل مرجوعی",
                nonReturnable1:
                    "تمام محصولات آرایشی و بهداشتی فروخته شده توسط نور سئول به دلیل مقررات بهداشت و ایمنی، غیرقابل مرجوعی و غیرقابل بازپرداخت هستند."
            }
            : {
            title: "Shipping & Returns",
            subtitle: "Thank you for shopping with Noor Seoul. Please review our shipping and returns policy below.",
            currencyLabel: "Currency",
            shippingTitle: "Shipping Fees",
            shippingIntro: "Shipping charges are calculated based on your order subtotal:",
            shippingLine1: `Orders below ${amounts.lowThreshold}: ${amounts.lowFee} shipping fee`,
            shippingLine2: `Orders from ${amounts.lowThreshold} to ${amounts.midThreshold}: ${amounts.midFee} shipping fee`,
            shippingLine3: `Orders above ${amounts.midThreshold} up to ${amounts.highThreshold}: ${amounts.highFee} shipping fee`,
            shippingLine4: `Orders above ${amounts.highThreshold}: ${amounts.topFee} shipping fee`,
            shippingNote: "The shipping fee is shown clearly at checkout before payment is completed.",
            conversionNote:
                currency === "AED"
                    ? "Prices are shown in AED."
                    : currency === "T"
                        ? "Prices are shown in Toman."
                        : "Prices are shown in USD.",
            processingTitle: "Processing & Delivery",
            processing1: "Orders are normally processed within 1 to 2 business days.",
            processing2: "Delivery timelines may vary depending on your location, courier operations, and peak periods.",
            processing3: "Once your order is shipped, tracking details will be shared so you can follow your delivery.",
            processing4:
                "If you wish to receive your order earlier than the estimated time, please contact us for Express shipping for an extra charge (phone number will be added later).",
            returnsTitle: "Returns & Refunds",
            returns1: "If there is an issue with your order, please contact our support team as soon as possible.",
            returns2: "To be eligible for return review, items should be unused, in original condition, and in original packaging.",
            returns3: "Approved refunds are processed back to the original payment method. Processing times may vary by payment provider.",
            rewardTitle: "Free Shipping Reward",
            reward1: "We offer a Free Shipping reward through our Gems program.",
            reward2: "Customers can redeem this reward at 400 Gems.",
            reward3: "After redemption, the Free Shipping reward can be applied to your next eligible checkout according to your active reward balance and code usage.",
            policyLine1:
                "All shipping and delivery timelines are estimates and not guaranteed. Noor Seoul is not responsible for delays caused by factors beyond its control, such as customs processes, courier issues, weather conditions, or force majeure events.",
            policyLine2:
                "Shipping fees are non-refundable unless explicitly agreed upon by Noor Seoul.",
            policyLine3:
                "Orders will only be shipped to the address provided by the customer at checkout. Customers are responsible for ensuring the accuracy of their delivery address.",
            customsTitle: "Customs, Duties, and Taxes",
            customs1:
                "Customers are solely responsible for any customs fees, import duties, taxes, or other charges required by their country.",
            customs2:
                "Delays caused by customs clearance are beyond Noor Seoul's control and do not qualify for refunds or cancellations.",
            lostTitle: "Lost or Damaged Shipments",
            lost1:
                "Noor Seoul is not liable for packages lost or damaged during transit. However, we will assist in filing a claim with the courier for lost or damaged shipments.",
            lost2:
                "Customers must report damaged or missing items within 48 hours of receiving their order. Supporting documentation, such as photos of the damage, may be required.",
            changesTitle: "Changes and Cancellations",
            changes1:
                "Orders cannot be changed, canceled, or refunded once they have been shipped.",
            changes2:
                "If you wish to cancel or modify your order, contact us immediately after placing it. While we will do our best to accommodate requests, we cannot guarantee changes.",
            nonReturnableTitle: "Non-Returnable Items",
            nonReturnable1:
                "All cosmetic products sold by Noor Seoul are non-returnable and non-refundable due to hygiene and safety regulations."
            }

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <h1 className="font-serif text-4xl md:text-5xl text-center md:text-left">{copy.title}</h1>
                    <div className="flex items-center gap-2 self-center md:self-auto">
                        <label htmlFor="shipping-currency" className="text-sm text-muted-foreground">
                            {copy.currencyLabel}
                        </label>
                        <select
                            id="shipping-currency"
                            value={currency}
                            onChange={(event) => setCurrency(event.target.value as "USD" | "AED" | "T")}
                            className="h-10 rounded-lg border bg-white px-3 text-sm"
                        >
                            {allowedCurrencies.map((option) => (
                                <option key={option} value={option}>
                                    {option === "USD" ? "USD ($)" : option === "AED" ? "AED (د.إ)" : "Toman (T)"}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <p className="text-muted-foreground text-center mb-3 text-lg">
                    {copy.subtitle}
                </p>
                <p className="text-muted-foreground text-center mb-10 text-sm">
                    {copy.conversionNote}
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                    <section className="rounded-2xl border bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4">{copy.shippingTitle}</h2>
                        <p className="text-muted-foreground mb-4">
                            {copy.shippingIntro}
                        </p>
                        <ul className="space-y-2 text-sm md:text-base">
                            <li>{copy.shippingLine1}</li>
                            <li>{copy.shippingLine2}</li>
                            <li>{copy.shippingLine3}</li>
                            <li>{copy.shippingLine4}</li>
                        </ul>
                        <p className="text-muted-foreground mt-4 text-sm">
                            {copy.shippingNote}
                        </p>
                    </section>

                    <section className="rounded-2xl border bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4">{copy.processingTitle}</h2>
                        <p className="text-muted-foreground mb-3">{copy.processing1}</p>
                        <p className="text-muted-foreground mb-3">{copy.processing2}</p>
                        <p className="text-muted-foreground mb-3">{copy.processing3}</p>
                        <p className="text-muted-foreground">{copy.processing4}</p>
                    </section>
                </div>

                <section className="rounded-2xl border bg-neutral-50 p-6 shadow-sm mt-6">
                    <h2 className="text-2xl font-semibold mb-4">{copy.rewardTitle}</h2>
                    <p className="text-muted-foreground mb-3">{copy.reward1}</p>
                    <p className="text-muted-foreground mb-3">{copy.reward2}</p>
                    <p className="text-muted-foreground">{copy.reward3}</p>
                </section>

                <section className="rounded-2xl border bg-white p-6 shadow-sm mt-6">
                    <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
                        <li>{copy.policyLine1}</li>
                        <li>{copy.policyLine2}</li>
                        <li>{copy.policyLine3}</li>
                    </ul>
                </section>

                <section className="rounded-2xl border bg-white p-6 shadow-sm mt-6">
                    <h2 className="text-2xl font-semibold mb-4">{copy.customsTitle}</h2>
                    <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
                        <li>{copy.customs1}</li>
                        <li>{copy.customs2}</li>
                    </ul>
                </section>

                <section className="rounded-2xl border bg-white p-6 shadow-sm mt-6">
                    <h2 className="text-2xl font-semibold mb-4">{copy.lostTitle}</h2>
                    <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
                        <li>{copy.lost1}</li>
                        <li>{copy.lost2}</li>
                    </ul>
                </section>

                <section className="rounded-2xl border bg-white p-6 shadow-sm mt-6">
                    <h2 className="text-2xl font-semibold mb-4">{copy.changesTitle}</h2>
                    <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
                        <li>{copy.changes1}</li>
                        <li>{copy.changes2}</li>
                    </ul>
                </section>

                <section className="rounded-2xl border bg-white p-6 shadow-sm mt-6">
                    <h2 className="text-2xl font-semibold mb-4">{copy.nonReturnableTitle}</h2>
                    <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
                        <li>{copy.nonReturnable1}</li>
                    </ul>
                </section>
            </div>
        </div>
    )
}
