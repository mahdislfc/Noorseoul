"use client"

import { cn } from "@/lib/utils"
import { Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

const categories = [
    { id: "all", label: "All" },
    { id: "best-sellers", label: "Best Sellers" },
    { id: "discounted", label: "Discounted Items" },
    { id: "cleansers", label: "Cleansers" },
    { id: "toners", label: "Toners" },
    { id: "serums", label: "Ampoules/Serums" },
    { id: "moisturizers", label: "Moisturizers" },
    { id: "eye-creams", label: "Eye Creams" },
    { id: "makeup", label: "Makeup" },
    { id: "mists", label: "Mists" },
    { id: "coming-soon", label: "Coming Soon" },
];

export function BrandSidebar() {
    const searchParams = useSearchParams();
    const activeFilter = searchParams.get('filter') || 'all';

    return (
        <div className="w-full lg:w-64 flex-shrink-0">
            <h2 className="font-serif text-2xl mb-8 border-b pb-4 uppercase tracking-widest text-sm font-bold opacity-70">Shop by Category</h2>
            <nav className="flex flex-col gap-1">
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={{ query: { filter: cat.id } }}
                        scroll={false}
                        className={cn(
                            "text-left px-4 py-3 transition-all duration-300 rounded-none border-l-2 text-xs font-bold uppercase tracking-widest",
                            activeFilter === cat.id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-transparent text-muted-foreground/60 hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        {cat.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
