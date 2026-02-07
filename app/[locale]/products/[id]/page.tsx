import { Footer } from "@/components/layout/Footer"
import { ProductGallery } from "@/components/product/ProductGallery"
import { ProductInfo } from "@/components/product/ProductInfo"

export default function ProductPage({ params }: { params: { id: string } }) {
    // Mock product data based on ID (or just static for now)
    const product = {
        id: "1",
        name: "Radiance Gold Elixir",
        price: 450,
        oldPrice: 580,
        description: "A celestial blend of pure 24K gold flakes and high-density hyaluronic acid designed to illuminate your complexion and provide age-defying hydration. Experience the essence of Seoul luxury.",
        rating: 4.9,
        reviews: 120,
        tags: ["New Arrival", "Best Seller"],
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB6Skqj6R9g_Yd5gMztA47QOEih2SnfZG8iEOKZ_7F4Aq81W0OwIK_c9kPVNTafFCARoMsh-8rukNuQuKAaJmop19af5D5lu2xjzKvXImmDPXBKGvvroBFoCq2pBd0Vfz1fGNpiC87nP6hDWYqYs3s2zxFG9YpDaWCao_uAuBUqdehq1PE5WcQ8UUcFw0wx5HwIPxOesYUbnK-otbdkA8wTsx77x_aI9sKKxTc_9u1fjvIeoQN2VvLZgJob3PWjsxaU32MtqCSCufzg",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD3p-9xkmf9o7B9mVCxtseVPIH10CHklIkpGLMdbVO6Y9CEAj3A_QkajrOjIzs-9guXQ6dXHf_MnZLlD8qnm8rMyEYf8Z9Nj1JgjJK9rSSsBnMZQmk56xzMV5vdZe7rFDjRXyR9OnitF8G_sgsutCV64hRjBihzUQvT8FKFbfV0_n5DPyGoCmT9Gntu4MbAY4ca21fFS6L8NpaL8fR5I7PPMFoFv9roBWU6Lww6Kj3jQ5KPjT0zMcWZO8qN3pCDLBtftCk0iYnR9wuY",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCKozWBfvsua0XdehxNMguLyKXDphnbXq39blJPj7M55TbuAiuJJzoflwCYYT1shO3TFeN4mXSnJrCiEoyJn26xLDOQNQjT1nTjD0wjDkvzWqH4lWcOFdEIsNuqBlRwG4kx8GlhGZiy_PatqHrXLNV6fsVfxaoS3n0xhWK1Uj1zF5vQNLE_yPsZdkHf_USkUy9z9gpfksaDiEPy71-UBUzOuHsOMecR4Rso3UHw8M87rwEw1timNRtI3AXKSSDj6iSm6PiRfUXiCOq8",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAWL_rlRM47ZuC7mcI18JWj0Sf8sigg-z7r-vtBrVYne-YiJB5iTqihTrmFTdu_R7cqmGU6IqE13No2xFYe99sBsMnPSaq7h08HDmxJ0SO4hb-BJfb6Q8jZP3jUeYAh-bhfzUh0JL0uxGj-fuq5HQb1MpV4axFQCSeIILgcOhX4vD6F6Z_d_-9pfGKRtZcVXejVeIVBZEFvlCGGyBh3-KbJzKKDzGMRoG5xPLLa69n0u2BaNLU0Sy544LLWjugLtkU7qVDCSwEpfDhi"
        ]
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-background">
            <main className="flex-grow pt-24 pb-12">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-6 lg:px-20 mb-8">
                    <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-50">
                        <span>Home</span>
                        <span>/</span>
                        <span>Skincare</span>
                        <span>/</span>
                        <span className="text-foreground">{product.name}</span>
                    </nav>
                </div>

                <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    <div className="lg:col-span-7">
                        <ProductGallery images={product.images} />
                    </div>
                    <div className="lg:col-span-5">
                        <ProductInfo product={product} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
