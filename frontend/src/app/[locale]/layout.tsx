import React from 'react';
import { notFound } from 'next/navigation';

const locales = ['en', 'ko', 'fr', 'de', 'es', 'nl', 'da'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(params.locale)) {
    notFound();
  }

  return <>{children}</>;
}
