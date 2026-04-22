'use client';

import { Suspense } from 'react';
import ResultPage from '../app/result/page.jsx';

export default function ResultPageWrapper() {
  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <ResultPage />
    </Suspense>
  );
}
