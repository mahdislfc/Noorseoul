
import { Instagram, MessageCircle, Send } from "lucide-react"

export default function ContactPage() {
    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-6xl mb-8 text-center">Contact Us</h1>
            <div className="mx-auto max-w-4xl">
                <section className="rounded-3xl border border-pink-200/70 bg-gradient-to-br from-pink-50 via-white to-rose-50 p-8 md:p-12 shadow-[0_20px_60px_rgba(236,72,153,0.12)]">
                    <p className="text-center text-base md:text-lg text-muted-foreground">
                        Follow us on Instagram for new arrivals, offers, and beauty drops.
                    </p>
                    <div className="mt-10 flex flex-col items-center gap-5">
                        <a
                            href="https://www.instagram.com/noorseoul"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Noor Seoul Instagram"
                            className="inline-flex h-28 w-28 md:h-36 md:w-36 items-center justify-center rounded-full border-2 border-pink-300 bg-white text-pink-600 shadow-xl transition hover:scale-105 hover:border-pink-500 hover:text-pink-700"
                        >
                            <Instagram className="h-14 w-14 md:h-20 md:w-20" />
                        </a>
                        <a
                            href="https://www.instagram.com/noorseoul"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-full bg-black px-8 py-4 text-lg md:text-2xl font-bold tracking-wide text-white shadow-lg transition hover:bg-black/85"
                        >
                            @noorseoul
                        </a>
                    </div>
                </section>
                <section className="mt-8 rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-8 md:p-12 shadow-[0_20px_60px_rgba(16,185,129,0.12)]">
                    <p className="text-center text-base md:text-lg text-muted-foreground">
                        For inquiries or support, message us on WhatsApp.
                    </p>
                    <div className="mt-10 flex flex-col items-center gap-5">
                        <a
                            href="https://wa.me/821039439144"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Noor Seoul WhatsApp"
                            className="inline-flex h-28 w-28 md:h-36 md:w-36 items-center justify-center rounded-full border-2 border-emerald-300 bg-white text-emerald-600 shadow-xl transition hover:scale-105 hover:border-emerald-500 hover:text-emerald-700"
                        >
                            <MessageCircle className="h-14 w-14 md:h-20 md:w-20" />
                        </a>
                        <a
                            href="https://wa.me/821039439144"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-full bg-emerald-600 px-8 py-4 text-lg md:text-2xl font-bold tracking-wide text-white shadow-lg transition hover:bg-emerald-700"
                        >
                            WhatsApp: +82 10 3943 9144
                        </a>
                    </div>
                </section>
                <section className="mt-8 rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-8 md:p-12 shadow-[0_20px_60px_rgba(14,165,233,0.12)]">
                    <p className="text-center text-base md:text-lg text-muted-foreground">
                        You can also contact us on Telegram.
                    </p>
                    <div className="mt-10 flex flex-col items-center gap-5">
                        <a
                            href="https://t.me/noorseoul"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Noor Seoul Telegram"
                            className="inline-flex h-28 w-28 md:h-36 md:w-36 items-center justify-center rounded-full border-2 border-sky-300 bg-white text-sky-600 shadow-xl transition hover:scale-105 hover:border-sky-500 hover:text-sky-700"
                        >
                            <Send className="h-14 w-14 md:h-20 md:w-20" />
                        </a>
                        <a
                            href="https://t.me/noorseoul"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-full bg-sky-600 px-8 py-4 text-lg md:text-2xl font-bold tracking-wide text-white shadow-lg transition hover:bg-sky-700"
                        >
                            Telegram: @noorseoul
                        </a>
                    </div>
                </section>
                <div className="mt-6 flex flex-col items-center gap-3">
                    <a
                        href="https://www.instagram.com/noorseoul"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm md:text-base font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                        instagram.com/noorseoul
                    </a>
                    <a
                        href="https://wa.me/821039439144"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm md:text-base font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-800"
                    >
                        WhatsApp: +821039439144
                    </a>
                    <a
                        href="https://t.me/noorseoul"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm md:text-base font-medium text-sky-700 underline underline-offset-4 hover:text-sky-800"
                    >
                        Telegram: t.me/noorseoul
                    </a>
                </div>
            </div> 
        </div>
    )
}
