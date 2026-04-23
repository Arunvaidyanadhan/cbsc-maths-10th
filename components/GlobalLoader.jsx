'use client';

import { useEffect, useState } from 'react';

export default function GlobalLoader({ isLoading }) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (isLoading) {
      // Micro delay to prevent flicker on fast loads
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, 150);
    } else {
      setShowLoader(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-200">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-white/90">Loading...</div>
      </div>
    </div>
  );
}
