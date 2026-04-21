import { useState } from 'react';

export const usePricing = () => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPricing = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pricing?userId=${userId}`);
      const data = await res.json();
      setPricing(data);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  return { pricing, loading, fetchPricing };
};
