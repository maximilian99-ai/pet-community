import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'ko', 'fr', 'de', 'es', 'nl', 'da'];

export const defaultLocale = 'en';

export default getRequestConfig(async ({ locale }: { locale: string }) => {
  if (!locales.includes(locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
