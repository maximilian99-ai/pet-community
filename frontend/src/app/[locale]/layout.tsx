import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ChakraProvider } from '@chakra-ui/react';
import { ReactQueryClientProvider } from '@/components/ReactQueryProvider';
import { ColorModeProvider } from '@/components/ColorModeProvider';
import { Navbar } from '@/components/Navbar';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const locales = ['en', 'ko', 'fr', 'de', 'es', 'nl', 'da'];

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body style={{ margin: 0, padding: 0 }} className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReactQueryClientProvider>
            <ChakraProvider>
              <ColorModeProvider>
                <Navbar />
                <main>{children}</main>
              </ColorModeProvider>
            </ChakraProvider>
          </ReactQueryClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
