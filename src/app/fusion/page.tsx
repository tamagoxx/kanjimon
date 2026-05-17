'use client';

import { Suspense } from 'react';
import FusionPageContent from './FusionPageContent';

export default function FusionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a1519' }}>
        <div className="text-white/40">Loading...</div>
      </div>
    }>
      <FusionPageContent />
    </Suspense>
  );
}