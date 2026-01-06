import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail } from 'lucide-react';

// Sample order data — replace this with actual cart/order context or props
const orderedProducts = [
  { name: 'Kurta', price: 1299, quantity: 2 },
  { name: 'Jeans', price: 2099, quantity: 1 },
  { name: 'T-Shirt', quantity: 1 }, // No price: will fallback to ₹0
];

const OrderConfirmation = () => {
  const calculateTotal = () => {
    return orderedProducts.reduce((total, item) => {
      if (typeof item.price === 'number') {
        return total + item.price * item.quantity;
      }
      return total;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Card className="w-full max-w-md">
              <CardContent className="flex items-center space-x-4 p-6">
                <Mail className="w-8 h-8 text-blue-500" />
                <div className="text-left">
                  <h3 className="font-semibold">Confirmation Email</h3>
                  <p className="text-sm text-gray-600">
                    A confirmation email has been sent to your email address.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 🛍️ Order Summary */}
          <div className="bg-white shadow rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <ul className="divide-y">
              {orderedProducts.map((item, index) => (
                <li key={index} className="flex justify-between py-2 text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    ₹
                    {typeof item.price === 'number'
                      ? item.price.toLocaleString('en-IN')
                      : '0'}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold pt-4 border-t mt-4">
              <span>Total</span>
              <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <Button asChild size="lg">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
            <br />
            <Button variant="outline" asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
