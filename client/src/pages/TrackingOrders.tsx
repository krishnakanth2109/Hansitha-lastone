// src/pages/TrackingOrders.tsx (REPLACE ENTIRE FILE)

import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Loader2, CheckCircle, Truck, XCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const API_URL = import.meta.env.VITE_API_URL;

export default function TrackingOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [order, setOrder] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'polling' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOrderAndTracking = async (orderId: string) => {
    try {
      // First, get the latest order details
      const orderRes = await axios.get(`${API_URL}/api/orders/${orderId}`, { withCredentials: true });
      const currentOrder = orderRes.data;
      setOrder(currentOrder);

      // If AWB code exists, fetch the detailed tracking history
      if (currentOrder.shipmentDetails?.awbCode) {
        const trackingRes = await axios.get(`${API_URL}/api/shipping/track/${orderId}`, { withCredentials: true });
        if (trackingRes.data?.tracking_data) {
          setTrackingData(trackingRes.data.tracking_data);
        }
        setStatus('success');
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      } else {
        // If no AWB code, we need to poll
        setStatus('polling');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage("Could not fetch order details. It might not exist or you may not have permission to view it.");
    }
  };

  // This effect runs once on component mount to initialize the state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderIdFromUrl = params.get('order_id');
    const orderFromState = location.state?.order;

    const orderIdToFetch = orderFromState?._id || orderIdFromUrl;

    if (orderIdToFetch) {
      fetchOrderAndTracking(orderIdToFetch);
    } else {
      setStatus('error');
      setErrorMessage("No Order ID provided.");
    }
  }, [location.search, location.state]);

  // This effect handles the polling logic
  useEffect(() => {
    if (status !== 'polling' || !order?._id) return;

    const poll = async () => {
      fetchOrderAndTracking(order._id);
    };

    pollingIntervalRef.current = setInterval(poll, 5000); // Poll every 5 seconds

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [status, order?._id]);

  // --- RENDER LOGIC ---

  if (status === 'loading') {
    return <div className="text-center p-10 flex items-center justify-center min-h-screen"><Loader2 className="animate-spin inline-block mr-2" />Loading order details...</div>;
  }

  if (status === 'error' || !order) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-lg border shadow-lg max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">An Error Occurred</h1>
          <p className="text-muted-foreground mb-6">{errorMessage || "Could not load order information."}</p>
          <Button onClick={() => navigate('/account')}>Go to My Account</Button>
        </div>
      </div>
    );
  }

  if (status === 'polling') {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-lg border shadow-lg max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin mb-6" />
          <h1 className="text-2xl font-bold mb-2">Confirming Your Order</h1>
          <p className="text-muted-foreground mb-8">
            Your payment was successful! We are generating your shipping label. This page will update automatically.
          </p>
          <div className="text-left text-sm text-muted-foreground space-y-2">
            <p><strong>Order ID:</strong> #{order._id.slice(-8).toUpperCase()}</p>
            <p><strong>Status:</strong> {order.paymentStatus === 'paid' ? 'Paid, Awaiting Shipment' : 'Payment Processing'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // --- SUCCESS VIEW ---
  const scans = trackingData?.scans || [];
  const lastScan = scans[scans.length - 1] || {};

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Order Status</span>
              <span className="font-mono text-sm font-medium">#{order._id.slice(-8).toUpperCase()}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(lastScan.date || order.createdAt).toLocaleString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800">AWB Code: {order.shipmentDetails.awbCode}</h3>
              <p className="text-sm text-blue-700">Courier: {order.shipmentDetails.courierName}</p>
              <a
                href={`https://shiprocket.co/tracking/${order.shipmentDetails.awbCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline font-medium mt-1 inline-block"
              >
                Track on Shiprocket's Website &rarr;
              </a>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="font-semibold mb-2">Tracking History</h3>
              {scans.length > 0 ? (
                scans.slice().reverse().map((scan: any, index: number) => ( // Show most recent first
                  <div key={index} className="flex gap-4 text-sm items-start">
                    <div className="w-28 text-muted-foreground whitespace-nowrap">
                      {new Date(scan.date).toLocaleDateString()}<br/>
                      {new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-shrink-0 pt-1"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                    <div className="flex-1">{scan.activity} - {scan.location}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tracking history available yet. The package is being prepared for dispatch.</p>
              )}
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Shipping To</h3>
                <address className="not-italic text-sm text-muted-foreground">
                  <strong>{order.address.name}</strong><br />
                  {order.address.houseNumber}, {order.address.street}<br/>
                  {order.address.area}, {order.address.city}, {order.address.pincode}
                </address>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between"><span>Total:</span><span className="font-bold text-foreground">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.totalAmount)}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}