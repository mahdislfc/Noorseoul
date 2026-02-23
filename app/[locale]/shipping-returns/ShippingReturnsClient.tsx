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
            returnsTitle: "الاسترجاع واسترداد المبلغ",
            returns1: "في حال وجود أي مشكلة في الطلب، يرجى التواصل مع فريق الدعم في أقرب وقت ممكن.",
            returns2: "للنظر في طلب الاسترجاع، يجب أن تكون المنتجات غير مستخدمة وبحالتهـا الأصلية ومع التغليف الأصلي.",
            returns3: "يتم رد المبالغ المعتمدة إلى وسيلة الدفع الأصلية، وقد تختلف مدة ظهور المبلغ حسب مزود الدفع.",
            rewardTitle: "مكافأة الشحن المجاني",
            reward1: "نوفر مكافأة الشحن المجاني ضمن برنامج الجواهر.",
            reward2: "يمكن استبدال هذه المكافأة عند الوصول إلى 400 جوهرة.",
            reward3: "بعد الاستبدال، يمكن استخدام الشحن المجاني في عملية الشراء التالية المؤهلة وفق الرصيد النشط واستخدام الكود."
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
                returnsTitle: "مرجوعی و بازپرداخت",
                returns1: "در صورت وجود هرگونه مشکل در سفارش، لطفا در سریع ترین زمان با تیم پشتیبانی تماس بگیرید.",
                returns2: "برای بررسی مرجوعی، کالا باید استفاده نشده، در وضعیت اولیه و با بسته بندی اصلی باشد.",
                returns3: "بازپرداخت تاییدشده به روش پرداخت اصلی انجام می شود و زمان آن بسته به درگاه پرداخت متفاوت است.",
                rewardTitle: "پاداش ارسال رایگان",
                reward1: "پاداش ارسال رایگان در برنامه Gems ارائه می شود.",
                reward2: "این پاداش با 400 Gem قابل دریافت است.",
                reward3: "پس از دریافت، ارسال رایگان برای اولین تسویه حساب واجد شرایط بعدی شما اعمال می شود."
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
            returnsTitle: "Returns & Refunds",
            returns1: "If there is an issue with your order, please contact our support team as soon as possible.",
            returns2: "To be eligible for return review, items should be unused, in original condition, and in original packaging.",
            returns3: "Approved refunds are processed back to the original payment method. Processing times may vary by payment provider.",
            rewardTitle: "Free Shipping Reward",
            reward1: "We offer a Free Shipping reward through our Gems program.",
            reward2: "Customers can redeem this reward at 400 Gems.",
            reward3: "After redemption, the Free Shipping reward can be applied to your next eligible checkout according to your active reward balance and code usage."
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
                        <p className="text-muted-foreground">{copy.processing3}</p>
                    </section>
                </div>

                <section className="rounded-2xl border bg-white p-6 shadow-sm mt-6">
                    <h2 className="text-2xl font-semibold mb-4">{copy.returnsTitle}</h2>
                    <p className="text-muted-foreground mb-3">{copy.returns1}</p>
                    <p className="text-muted-foreground mb-3">{copy.returns2}</p>
                    <p className="text-muted-foreground">{copy.returns3}</p>
                </section>

                <section className="rounded-2xl border bg-neutral-50 p-6 shadow-sm mt-6">
                    <h2 className="text-2xl font-semibold mb-4">{copy.rewardTitle}</h2>
                    <p className="text-muted-foreground mb-3">{copy.reward1}</p>
                    <p className="text-muted-foreground mb-3">{copy.reward2}</p>
                    <p className="text-muted-foreground">{copy.reward3}</p>
                </section>
            </div>
        </div>
    )
}
