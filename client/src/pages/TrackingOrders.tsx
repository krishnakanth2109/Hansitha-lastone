import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Loader2, XCircle, Package, Cog, Truck, PackageCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL;

interface TrackingDetails { awbCode?: string; courierName?: string; }
interface Order {
  _id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  trackingDetails?: TrackingDetails;
  shipmentDetails?: TrackingDetails;   // alias kept for compatibility
}

const STATUS_STEPS = ["Placed", "Processing", "Shipped", "In Transit", "Delivered"];

const STATUS_ICON: Record<string, React.ReactNode> = {
  "Placed":           <Package size={48} className="text-blue-500 mx-auto mb-4" />,
  "Processing":       <Cog size={48} className="text-blue-500 mx-auto mb-4 animate-spin" />,
  "Shipped":          <Truck size={48} className="text-blue-500 mx-auto mb-4" />,
  "In Transit":       <Truck size={48} className="text-indigo-500 mx-auto mb-4" />,
  "Delivered":        <PackageCheck size={48} className="text-green-500 mx-auto mb-4" />,
  "Cancelled":        <XCircle size={48} className="text-red-500 mx-auto mb-4" />,
  "Undelivered":      <XCircle size={48} className="text-orange-500 mx-auto mb-4" />,
  "Return In Progress":<Truck size={48} className="text-yellow-500 mx-auto mb-4" />,
  "Returned":         <Package size={48} className="text-gray-500 mx-auto mb-4" />,
  "Refunded":         <PackageCheck size={48} className="text-gray-400 mx-auto mb-4" />,
};

const STATUS_COLOR: Record<string, string> = {
  "Placed":           "bg-blue-100 text-blue-800",
  "Processing":       "bg-indigo-100 text-indigo-800",
  "Shipped":          "bg-cyan-100 text-cyan-800",
  "In Transit":       "bg-purple-100 text-purple-800",
  "Delivered":        "bg-green-100 text-green-800",
  "Cancelled":        "bg-red-100 text-red-800",
  "Undelivered":      "bg-orange-100 text-orange-800",
  "Return In Progress":"bg-yellow-100 text-yellow-800",
  "Returned":         "bg-gray-100 text-gray-800",
  "Refunded":         "bg-gray-100 text-gray-600",
};

const TrackingOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: paramOrderId } = useParams<{ orderId: string }>();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const [order, setOrder] = useState<Order | null>(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  const orderId = paramOrderId || order?._id || new URLSearchParams(location.search).get('order_id');

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/${orderId}`, { withCredentials: true });
        // Normalise: ensure shipmentDetails alias mirrors trackingDetails
        const data = res.data;
        data.shipmentDetails = data.trackingDetails || data.shipmentDetails || {};
        setOrder(data);
        setError('');
      } catch {
        setError("Could not load order details.");
        if (pollingRef.current) clearInterval(pollingRef.current);
      } finally {
        setLoading(false);
      }
    };

    fetch();
    pollingRef.current = setInterval(fetch, 10000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [orderId]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
        <p className="text-gray-500 mb-6">{error || "This order could not be found."}</p>
        <Button onClick={() => navigate('/orders')}>Back to My Orders</Button>
      </div>
    </div>
  );

  const tracking = order.trackingDetails || order.shipmentDetails || {};
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = ['Cancelled', 'Undelivered', 'Returned', 'Refunded', 'Return In Progress'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">

        {/* Icon + Status */}
        <div className="text-center mb-6">
          {STATUS_ICON[order.status] || <Package size={48} className="text-gray-400 mx-auto mb-4" />}
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-700'}`}>
            {order.status}
          </span>
          <p className="text-gray-500 text-sm mt-3">
            Order <span className="font-mono font-semibold text-gray-700">#{order._id.slice(-8).toUpperCase()}</span>
            <br />Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Progress bar for normal flow */}
        {!isCancelled && stepIndex >= 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-3 left-0 right-0 h-1 bg-gray-200 z-0">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex flex-col items-center z-10 flex-1">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                    ${i <= stepIndex ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                    {i < stepIndex ? '✓' : i === stepIndex ? '●' : '○'}
                  </div>
                  <span className={`text-[9px] mt-1 text-center leading-tight ${i <= stepIndex ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment status notice */}
        {order.paymentStatus !== 'paid' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            Payment status: <strong>{order.paymentStatus}</strong> — tracking will update once payment is confirmed.
          </div>
        )}

        {/* Tracking details (shown once admin adds them) */}
        {tracking.awbCode && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Shipping Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Courier</p>
                <p className="font-semibold">{tracking.courierName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Tracking Number</p>
                <p className="font-mono font-bold text-blue-600">{tracking.awbCode}</p>
              </div>
            </div>
          </div>
        )}

        {!tracking.awbCode && order.paymentStatus === 'paid' && !isCancelled && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 mb-4 text-center text-sm text-gray-400">
            Tracking info will appear here once your order is shipped.
          </div>
        )}

        <p className="text-xs text-center text-gray-400 mb-4">This page refreshes automatically every 10 seconds.</p>

        <Button onClick={() => navigate('/orders')} className="w-full">← Back to My Orders</Button>
      </div>
    </div>
  );
};

export default TrackingOrders;