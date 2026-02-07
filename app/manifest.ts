import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Noor Seoul',
        short_name: 'Noor Seoul',
        description: 'Premium Korean Skincare & Beauty',
        start_url: '/',
        display: 'standalone',
        background_color: '#FAF9F6',
        theme_color: '#ECB613',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
