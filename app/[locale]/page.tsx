import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/home/Hero"
import { Categories } from "@/components/home/Categories"
import { Testimonials } from "@/components/home/Testimonials"
import { Discover } from "@/components/home/Discover"
import { DiscoverBrands } from "@/components/home/DiscoverBrands"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
      <main className="flex-grow">
        <Hero />
        <Categories />
        <Discover />
        <DiscoverBrands />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
