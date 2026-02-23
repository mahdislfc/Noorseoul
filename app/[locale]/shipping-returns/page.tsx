import { ShippingReturnsClient } from "./ShippingReturnsClient"

export default async function ShippingReturnsPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    return <ShippingReturnsClient locale={locale} />
}

