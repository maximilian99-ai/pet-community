import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ChakraProvider } from '@chakra-ui/react';
import { ReactQueryClientProvider } from '@/components/ReactQueryProvider';
import { ColorModeProvider } from '@/components/ColorModeProvider';
import { Navbar } from '@/components/Navbar';

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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
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

