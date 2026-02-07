import { Link } from '@/i18n/routing';
import { ArrowRight } from "lucide-react"

const discoverItems = [
    {
        title: "Skincare Tips",
        description: "Expert advice for your daily ritual.",
        link: "/skincare-tips",
        color: "bg-rose-100",
        image: "/images/skincare-tips.jpg"
    },
    {
        title: "Makeup Tips",
        description: "Artistry techniques for a flawless look.",
        link: "/makeup-tips",
        color: "bg-amber-100"
    },
    {
        title: "Gift Sets",
        description: "Curated collections for your loved ones.",
        link: "/gift-sets",
        color: "bg-stone-100",
        image: "/images/gift-sets.jpg"
    },
    {
        title: "Next Arrivals",
        description: "Be the first to know what's coming next.",
        link: "/next-arrivals",
        color: "bg-orange-50"
    }
]

export function Discover() {
    return (
        <section className="py-20 px-6 lg:px-20 bg-background">
            <h2 className="font-serif text-4xl mb-12 text-center">Discover</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 group/discover">
                {discoverItems.map((item, index) => (
                    <Link key={index} href={item.link} className={`group relative p-8 ${item.color} h-64 flex flex-col justify-center text-center hover:shadow-lg transition-all duration-500 group-hover/discover:opacity-40 hover:!opacity-100 hover:scale-105 hover:brightness-105 overflow-hidden`}>
                        {item.image && (
                            <>
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url('${item.image}')` }}
                                />
                                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors duration-300" />
                            </>
                        )}
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div>
                                <h3 className={`font-bold text-xl mb-2 font-serif ${item.image ? 'text-white drop-shadow-lg' : ''}`}>{item.title}</h3>
                                <div className="grid transition-all duration-300 grid-rows-[0fr] group-hover:grid-rows-[1fr]">
                                    <p className={`text-sm overflow-hidden ${item.image ? 'text-white/95 drop-shadow-lg' : 'text-muted-foreground'}`}>{item.description}</p>
                                </div>
                            </div>
                            <div className={`flex items-center font-medium text-sm transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${item.image ? 'text-white' : 'text-primary'}`}>
                                Explore <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
