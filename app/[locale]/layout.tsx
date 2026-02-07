import type { Metadata } from "next";
import { Manrope, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "../globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

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
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!['en', 'ar'].includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${manrope.variable} ${cormorant.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased text-foreground bg-background">
        <NextIntlClientProvider messages={messages}>
          <UserProvider>
            <CartProvider>
              <Header />
              {children}
              <Toaster />
            </CartProvider>
          </UserProvider>
        </NextIntlClientProvider>
      </body>
    </html >
  );
}
