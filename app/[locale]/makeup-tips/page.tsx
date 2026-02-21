import { useTranslations } from 'next-intl';

export default function MakeupTipsPage() {
    const t = useTranslations('Tips')

    return (
        <div className="container mx-auto px-6 lg:px-20 py-12 mt-20">
            <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">{t('makeupTitle')}</h1>
            <div className="max-w-3xl mx-auto prose prose-lg">
                <p className="text-center text-muted-foreground">
                    {t('makeupSubtitle')}
                </p>
                {/* Add your content here */}
            </div>
        </div>
    )
}
