import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ChakraProvider } from '@chakra-ui/react';
import { ReactQueryClientProvider } from '@/components/ReactQueryProvider';

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
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ReactQueryClientProvider>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </ReactQueryClientProvider>
    </NextIntlClientProvider>
  );
}

