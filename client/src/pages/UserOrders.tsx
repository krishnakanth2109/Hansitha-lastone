import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader, PackageSearch } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface Order {
  _id: string;
  totalAmount: number;
  createdAt: string;
  status: string;
  paymentStatus: string;
  cartItems: {
    image: string;
    name: string;
  }[];
  trackingDetails?: { awbCode?: string; courierName?: string; };
  shipmentDetails?: { awbCode?: string; courierName?: string; };
}

const STATUS_COLOR: Record<string, string> = {
  "Placed":           "text-blue-600",
  "Processing":       "text-indigo-600",
  "Shipped":          "text-cyan-600",
  "In Transit":       "text-purple-600",
  "Delivered":        "text-green-600",
  "Cancelled":        "text-red-500",
  "Undelivered":      "text-orange-500",
  "Returned":         "text-gray-500",
  "Refunded":         "text-gray-400",
  "Return In Progress": "text-yellow-600",
};

const UserOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/orders/my-orders`, {
          withCredentials: true,
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <PackageSearch className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <p className="font-semibold">You have no orders yet.</p>
          <p className="text-sm mt-2">When you place an order, it will appear here.</p>
          <Link to="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-4 rounded-lg shadow-md transition hover:shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between border-b pb-3 mb-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">ORDER PLACED</p>
                  <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">TOTAL</p>
                  <p className="text-sm font-semibold">₹{order.totalAmount?.toLocaleString()}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-gray-500 font-medium">ORDER #</p>
                  <p className="text-sm text-gray-600 break-all font-mono">{order._id.slice(-10).toUpperCase()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {order.cartItems[0]?.image && (
                    <img
                      src={order.cartItems[0].image}
                      alt={order.cartItems[0]?.name}
                      className="w-16 h-16 object-cover rounded-md hidden sm:block flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg truncate">{order.cartItems[0]?.name}</h3>
                    {order.cartItems.length > 1 && (
                      <p className="text-xs text-gray-500">+ {order.cartItems.length - 1} more item(s)</p>
                    )}
                    <p className={`text-sm font-bold mt-1 ${STATUS_COLOR[order.status] || 'text-gray-600'}`}>
                      {order.status}
                    </p>
                    {/* Show payment pending warning */}
                    {order.paymentStatus === 'pending' && (
                      <p className="text-xs text-yellow-600 mt-0.5">⚠️ Payment confirming...</p>
                    )}
                  </div>
                </div>

                {/* ✅ FIXED: Link now includes orderId in the URL path
                    /track-order/:orderId  ← TrackingOrders reads useParams().orderId
                    Also passes order as state for instant render before fetch completes */}
                <Link
                  to={`/track-order/${order._id}`}
                  state={{ order }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-100 flex-shrink-0"
                >
                  Track Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;