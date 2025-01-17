import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { Locale } from '@/i18n/types';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/i18n/dictionaries/${locale}.json`)).default,
  };
});
