// utils/razorpay.ts
import axios from 'axios';

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

type RazorpayItem = {
  name: string;
  quantity: number;
  price: number;
};

interface RazorpayProps {
  amount: number;
  items: RazorpayItem[];
  userId: string;
  address: any; // type based on your address structure
  onSuccess: (orderId: string) => void;
  onFailure?: () => void;
}

export const initiateRazorpayPayment = async ({
  amount,
  items,
  userId,
  address,
  onSuccess,
  onFailure,
}: RazorpayProps) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }

  try {
    // 1. Create Razorpay order from backend
    const orderRes = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/payment/orders`,
      {
        amount: amount * 100, // in paise
      }
    );

    const { id: razorpayOrderId, amount: razorpayAmount } = orderRes.data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
      amount: razorpayAmount,
      currency: 'INR',
      name: 'My Store',
      description: 'Order Payment',
      order_id: razorpayOrderId,
      handler: async function (response: any) {
        try {
          // 2. Send verification & save order
          const verifyRes = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/payment/verify`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items,
              amount,
              userId,
              address,
            }
          );

          const { orderId } = verifyRes.data;
          // 3. Redirect to success page
          onSuccess(orderId);
        } catch (err) {
          console.error('Payment verification failed:', err);
          alert('Payment succeeded but verification failed. Contact support.');
          onFailure?.();
        }
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999',
      },
      notes: {
        items: JSON.stringify(items),
      },
      theme: {
        color: '#6366f1',
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error('Payment failed:', err);
    alert('Something went wrong. Please try again.');
    onFailure?.();
  }
};
