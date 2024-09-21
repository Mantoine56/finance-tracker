'use client';

import dynamic from 'next/dynamic';

const FinanceTracker = dynamic(() => import('./components/FinanceTracker'), {
  ssr: false,
});

export default function Home() {
  return <FinanceTracker />;
}