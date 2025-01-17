import { Open_Sans } from 'next/font/google';
import '../globals.css';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Locale } from '@/i18n/types';
import { SessionProvider } from '@/components/session-sync';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/nav';

const geistOpenSans = Open_Sans({
  variable: '--font-geist-open-sans',
  subsets: ['latin'],
});

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params; // Aguarde params antes de usar

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${geistOpenSans.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <SidebarProvider>
              <AppSidebar />
              <main>
                <SidebarTrigger />
                {children}
              </main>
            </SidebarProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
