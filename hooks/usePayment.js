import { useState } from 'react';

export const usePayment = ({ onSuccess, onFailure, userId }) => {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const startPayment = async (userDetails) => {
    setPaying(true);
    setError(null);
    try {
      // Step 1: create order
      const orderRes = await fetch(`/api/create-order?userId=${userId}`, { method: 'POST' });
      if (!orderRes.ok) throw new Error('Order creation failed');
      const { order_id, amount, currency, key_id } = await orderRes.json();

      // Step 2: open Razorpay
      const options = {
        key: key_id,
        amount,
        currency,
        name: 'MathBuddy',
        description: 'Full Access – 1 Year',
        order_id,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
        },
        theme: { color: '#0D7A6A' },
        handler: async (response) => {
          // Step 3: verify
          try {
            const verifyRes = await fetch(`/api/verify-payment?userId=${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            });
            if (verifyRes.ok) {
              onSuccess();
            } else {
              setError('Verification failed. Contact support if amount was deducted.');
              setPaying(false);
            }
          } catch {
            setError('Network error during verification. Please contact support.');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again.');
        setPaying(false);
      });
      rzp.open();

    } catch (err) {
      setError('Something went wrong. Please try again.');
      setPaying(false);
    }
  };

  return { startPayment, paying, error };
};
