import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Partners from '@/views/Partners';

export default async function PartnersPage() {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Partners />
    </NextIntlClientProvider>
  );
}
