'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FusionRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/collection?tab=fusion');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a1519' }}>
      <div className="text-white">Redirecting...</div>
    </div>
  );
}