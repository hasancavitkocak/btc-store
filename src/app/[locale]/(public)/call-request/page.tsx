import CallRequest from '@/pages/CallRequest';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Call Request - Btc Store',
  description: 'Request a call from our team',
};

export default function CallRequestPage() {
  return <CallRequest />;
}
