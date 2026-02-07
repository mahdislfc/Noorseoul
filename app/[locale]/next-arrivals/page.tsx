import { useTranslations } from 'next-intl';

export default function NextArrivalsPage() {
    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">Next Arrivals</h1>
            <div className="max-w-3xl mx-auto prose prose-lg text-center">
                <p className="text-muted-foreground mb-12">
                    Be the first to know what's coming next from Seoul.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="bg-secondary/20 p-8 rounded-lg">
                        <span className="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">Coming Soon</span>
                        <h3 className="font-serif text-2xl mb-2">Spring Blossom Collection</h3>
                        <p className="text-sm text-gray-600">A limited edition range featuring cherry blossom extracts.</p>
                    </div>
                    <div className="bg-secondary/20 p-8 rounded-lg">
                        <span className="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">Coming Soon</span>
                        <h3 className="font-serif text-2xl mb-2">Advanced Night Repair 2.0</h3>
                        <p className="text-sm text-gray-600">The next generation of our best-selling serum.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
