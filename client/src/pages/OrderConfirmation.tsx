import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail, Loader2, XCircle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface OrderItem { name: string; price: number; quantity: number; image?: string; }
interface Order {
  _id: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  cartItems: OrderItem[];
  email: string;
  createdAt: string;
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  // Razorpay callback also passes razorpay_payment_link_id etc. as query params
  const razorpayStatus = searchParams.get('razorpay_payment_link_status');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/${orderId}`, { withCredentials: true });
        setOrder(res.data);
        // If still pending after Razorpay says paid, keep polling (webhook may be in-flight)
        if (res.data.paymentStatus === 'pending' && pollCount < 10) {
          setTimeout(() => setPollCount(c => c + 1), 3000);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, pollCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-pink-400">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order && !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-pink-400">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <Button asChild><Link to="/orders">View My Orders</Link></Button>
        </div>
      </div>
    );
  }

  // Payment still pending — webhook may still be in-flight
  if (order?.paymentStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-pink-400">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
          <Clock className="w-14 h-14 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Processing...</h1>
          <p className="text-gray-500 mb-6">
            Your payment is being confirmed. This page will update automatically in a few seconds.
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-6" />
          <Button variant="outline" asChild><Link to="/orders">View My Orders</Link></Button>
        </div>
      </div>
    );
  }

  // Payment failed
  if (order?.paymentStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-pink-400">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
          <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
          <p className="text-gray-500 mb-6">Your payment could not be processed. Please try again.</p>
          <div className="space-y-3">
            <Button asChild className="w-full"><Link to="/checkout">Try Again</Link></Button>
            <Button variant="outline" asChild className="w-full"><Link to="/orders">My Orders</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  // Payment confirmed ✅
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white drop-shadow mb-2">Order Confirmed!</h1>
          <p className="text-white/90 mb-8">
            Thank you for your purchase. Your order has been received.
          </p>

          <Card className="w-full mb-6">
            <CardContent className="flex items-center space-x-4 p-6">
              <Mail className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Confirmation Email Sent</h3>
                <p className="text-sm text-gray-600">Check your inbox at <strong>{order?.email}</strong></p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          {order && (
            <div className="bg-white shadow rounded-2xl p-6 mb-8 text-left">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <span className="text-xs font-mono text-gray-400">#{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <ul className="divide-y">
                {order.cartItems.map((item, i) => (
                  <li key={i} className="flex items-center justify-between py-3 text-sm gap-3">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border" />}
                      <span className="font-medium">{item.name} <span className="text-gray-400 font-normal">× {item.quantity}</span></span>
                    </div>
                    <span className="font-semibold whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold pt-4 border-t mt-2 text-lg">
                <span>Total Paid</span>
                <span className="text-green-600">₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg"><Link to="/orders">Track My Order</Link></Button>
            <Button variant="outline" asChild size="lg" className="bg-white"><Link to="/shop">Continue Shopping</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;