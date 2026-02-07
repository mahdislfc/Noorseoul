import { Quote, Star } from "lucide-react"

export function Testimonials() {
    return (
        <section className="py-20 bg-background text-foreground overflow-hidden">
            <div className="container mx-auto px-6 lg:px-20 text-center">
                <h2 className="font-serif text-3xl mb-12">Client Reviews</h2>
            </div>
            <div className="flex justify-center px-6">
                <div className="max-w-2xl w-full text-center relative group">
                    <div className="p-8 bg-secondary/10 rounded-2xl relative">
                        <Quote className="text-primary/20 w-10 h-10 absolute -top-3 -left-3" />
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                            ))}
                        </div>
                        <blockquote className="font-serif text-xl italic leading-relaxed mb-6 text-foreground/80">
                            "The Golden Glow Serum has completely transformed my evening routine. My skin has never looked so luminous and well-rested. Truly the definition of luxury."
                        </blockquote>
                        <cite className="not-italic">
                            <span className="block font-bold uppercase tracking-widest text-xs text-primary">Elena Rodriguez</span>
                            <span className="block text-[10px] text-muted-foreground uppercase mt-0.5">Vogue Beauty Editor</span>
                        </cite>
                    </div>
                </div>
            </div>
        </section>
    )
}
