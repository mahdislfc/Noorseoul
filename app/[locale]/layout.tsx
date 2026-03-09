import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Noor Seoul | Premium Korean Skincare",
  description: "Discover radiant skin with our luxury Korean beauty collection.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Noor Seoul",
  },
};

export const viewport = {
  themeColor: "#ECB613",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import { DisplayCurrencyProvider } from "@/context/DisplayCurrencyContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";
import { AbortErrorGuard } from "@/components/system/AbortErrorGuard";

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isSupportedLocale = locale === "en" || locale === "ar" || locale === "fa";

  // Ensure that the incoming `locale` is valid
  if (!isSupportedLocale) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' || locale === "fa" ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="font-sans antialiased text-foreground bg-background">
        <NextIntlClientProvider messages={messages}>
          <UserProvider>
            <DisplayCurrencyProvider locale={locale}>
              <CartProvider>
                <AbortErrorGuard />
                <Header />
                {children}
                <Toaster />
              </CartProvider>
            </DisplayCurrencyProvider>
          </UserProvider>
        </NextIntlClientProvider>
      </body>
    </html >
  );
}
