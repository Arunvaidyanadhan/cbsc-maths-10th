'use client';

import { useState, useEffect } from 'react';
import { usePricing } from '../hooks/usePricing';
import { usePayment } from '../hooks/usePayment';

export default function PaywallModal({ isOpen, onClose, onUpgrade }) {
  const { pricing, loading, fetchPricing } = usePricing();
  const { startPayment, paying, error } = usePayment({
    onSuccess: () => {
      onUpgrade();
      onClose();
    },
    onFailure: () => {},
  });

  useEffect(() => {
    if (isOpen) {
      fetchPricing();
    }
  }, [isOpen, fetchPricing]);

  if (!isOpen) return null;

  const handlePayment = () => {
    const userDetails = {
      name: 'Student',
      email: 'student@example.com'
    };
    startPayment(userDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="paywall-modal">
        {/* Header */}
        <div className="paywall-header">
          <h2>Unlock Full Access</h2>
          <p>You're making great progress! Keep going with all topics unlocked.</p>
        </div>

        {/* Pricing block */}
        <div className="paywall-price-block">
          {pricing?.tier === 'early_bird' && (
            <div className="paywall-early-badge">🎉 Early Supporter Offer</div>
          )}

          <div className="paywall-price">
            ₹{pricing?.price || 299}
            <span className="paywall-price-period">/year</span>
          </div>

          {pricing?.tier === 'standard' && (
            <div className="paywall-original-price">
              <s>₹99</s> Early bird closed
            </div>
          )}

          {pricing?.remaining_slots != null && (
            <div className={`paywall-slots ${pricing.remaining_slots < 10 ? 'urgent' : ''}`}>
              Only {pricing.remaining_slots} spots left at this price
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="paywall-features">
          <li>✓ All topics — Pass, Average & Expert levels</li>
          <li>✓ 500+ curated CBSE questions</li>
          <li>✓ Streak tracking & XP system</li>
          <li>✓ Estimated marks engine</li>
          <li>✓ 1 full year of access</li>
        </ul>

        {/* CTA */}
        <button
          className="paywall-cta-btn"
          onClick={handlePayment}
          disabled={paying || !pricing || loading}
        >
          {paying ? 'Processing...' : loading ? 'Loading...' : `Unlock for ₹${pricing?.price || 299}`}
        </button>

        {error && <p className="paywall-error">{error}</p>}

        <p className="paywall-guarantee">
          Secure payment via Razorpay · No auto-renewal
        </p>

        <button
          onClick={onClose}
          className="w-full mt-3 bg-card border-2 border-subtle text-heading font-semibold py-2 px-6 rounded-lg hover:bg-card-hover transition-all"
        >
          Continue Free
        </button>
      </div>
    </div>
  );
}
