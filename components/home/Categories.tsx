import { Link } from '@/i18n/routing';

const categories = [
    {
        name: "Makeup",
        href: "/makeup",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyNWbEDNKyUMY67gecV36TfzlaeqQY6rnXIWsmIm1opxVl7J2_UfCzuLZPaveovgjQe0YZ9GucFALuDry_IBWHbsvjBJZUM5k2knlCvnXI0j3i7MOjoNQVTN0Med7jw-n_MRMO8HbqwAqegvbycUiVtM0HxsRIakGgiPUnJ5IfnXEjuoSEH-o4uND_bUcMWAwJZclMTXGFLCUYzCJ3Dnl-oUj475OafQXZq9sRedIFUc0_7ef5mAKSWT6pcMHxw6E4Fjg2tVtXyZzS"
    },
    {
        name: "Skincare",
        href: "/skincare",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQdvAlFaO-keqoRVTPUy0tCLT6c-IQBdiOKS2-BrGJ8cmBT25lE8LHO4ivl8xSUWm-1FzzN2RT-s1w8IebKc_GAniX6ujdXjg8Ghfv3Lyoul-jAv8os65BqOH9i35TjtAt2u4a_B2yt3d4hWBKKZt9urUmESSPLQhivCsLlIXWTQVDOAn3qjO-ZXkp4GXhvSWwUFGf6hf7zp6mdu4YMeF2c_Dx36MrOIy0xjpONoJUf1zu_rTUnFyX_4aIuiRM9bQcAoEqc_nvTfoy"
    },
    {
        name: "New Arrivals",
        href: "/new-arrivals",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqGJ0yzuyhYZEHB47WeIN-ZKl_X2Zz-a_gslnkWhmqotAwscmPpPi7p_OWa9aTOYvb_8uqlsd4vQVGJ5qGX_jQAhDLpVaejVvy-scPZpAROiqKSnLbfz0tgTKM6b5LbNnWAhdzjRIJZLSMLidor4k5H01Q2tfKxyDWHj9aK0ai2CY_WM0zRSOqg8tkdr0_YxQaUCXcArAexWkoGyALM2ce-xKF2MnUsfZ-jR1_IPIVfMa1Ax-QmqiNLx-ySL_ha-w-icbDc6zQ3Yex"
    },
    {
        name: "Best Sellers",
        href: "/best-sellers",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKqNmLTfwsuRx3EOfWM7M4Zx67VyhPhd6Ww7ILvTzs7vx57b2aXRUm0DITRztt3EflJq0ggxwJYDD50HVNu-iCxlxPoGkcJTIu1zhrw3-wocp9_D_r0LFbToR18cjZaqRML5nhVsm95I55QYouPwVsBHcHpBHe9zxmwHBJ0wgHuZMefks6Hx2nStYx3x3H9VODK0_GdhSuXcqbVkFU1NmcPJUbcJxQrOb0lkKWGVhy-LgPi48QjW4zMHWp6usRcAtFG0Kuq2xqUD7I"
    }
]

export function Categories() {
    return (
        <section className="py-20 bg-background px-6 lg:px-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                    <h2 className="font-serif text-4xl mb-2">Beauty Essentials</h2>
                    <p className="text-muted-foreground">Discover our range of premium beauty products</p>
                </div>
                <Link href="/categories" className="text-primary font-bold border-b border-primary pb-1 uppercase tracking-tighter text-sm">
                    View All Categories
                </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 group/categories">
                {categories.map((category, index) => (
                    <Link href={category.href} key={index} className="group/card text-center transition-opacity duration-500 group-hover/categories:opacity-40 hover:!opacity-100">
                        <div className={`aspect-square rounded-full overflow-hidden border-2 transition-all duration-500 ease-out p-2 mb-4 border-transparent group-hover/card:border-primary group-hover/card:scale-105 group-hover/card:brightness-110 bg-secondary/20`}>
                            <div
                                className="w-full h-full rounded-full bg-cover bg-center"
                                style={{ backgroundImage: `url('https://placehold.co/400x400/e5e5e5/000?text=Nanobanana+Collection')` }}
                            />
                        </div>
                        <h3 className={`font-bold uppercase tracking-widest text-sm transition-colors group-hover/card:text-primary`}>
                            {category.name}
                        </h3>
                    </Link>
                ))}
            </div>
        </section>
    )
}
