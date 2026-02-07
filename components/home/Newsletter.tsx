import { Button } from "@/components/ui/button"

export function Newsletter() {
    return (
        <section className="pb-24 px-6 md:px-20 bg-background">
            <div
                className="max-w-6xl mx-auto rounded-3xl bg-cover bg-center overflow-hidden relative min-h-[400px] flex items-center justify-center p-8"
                style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuATF9joLfox9IRx2znGlf9dyBxx8P0Yt5EN5zV4FeiRFJ7BRhPXmqwSIGRnlpLnCUx0N65jfG2vOoB-KBTdRIyz1_Yk02hqULEBDAAPm2_tjPMdt2qig9l50KBlmmFyzRJF_6SxrqDl8J92R7sSoCC_LqErm8fB89QKRfYbAJ1k-6a8NJFUmPY1lWMuMd_bTqXLYPnoU8q8YWZ7qQGD3Kn46uUghL0K6EdCtbVpLSNCG4UsCx0mbiDYPAHEzNBRInzeXu01c7d2y4Bt')` }}
            >
                <div className="relative z-10 text-center max-w-xl text-white">
                    <h2 className="font-serif text-4xl mb-4">Join The Elite</h2>
                    <p className="mb-8 font-light text-white/80">Be the first to know about exclusive product launches, private events in Seoul, and beauty secrets from the experts.</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="email"
                            className="flex-1 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:ring-primary focus:border-primary backdrop-blur-md px-6 py-4"
                            placeholder="Your email address"
                        />
                        <Button size="lg" className="h-auto py-4">Subscribe</Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
