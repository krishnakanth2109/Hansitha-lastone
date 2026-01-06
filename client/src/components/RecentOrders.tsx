// src/components/RecentOrders.tsx (REPLACE ENTIRE FILE)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Package, Truck, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountSection } from "./AccountSection";
import { useAuth } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

// This config now matches your Order.js model status
const statusConfig: { [key: string]: { label: string; icon: React.ElementType; color: string } } = {
  Placed: { label: "Placed", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  Processing: { label: "Processing", icon: Package, color: "bg-yellow-100 text-yellow-800" },
  Shipped: { label: "Shipped", icon: Truck, color: "bg-blue-100 text-blue-800" },
  Delivered: { label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  Cancelled: { label: "Cancelled", icon: CheckCircle, color: "bg-red-100 text-red-800" },
};

export function RecentOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/users/my-orders`, { withCredentials: true });
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch recent orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);
const handleViewDetails = (order: any) => {
  navigate('/tracking-orders', { state: { order } });
};
  if (loading) {
    return (
      <AccountSection title="Recent Orders" icon={<Package className="h-5 w-5 text-primary" />}>
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading your orders...</span>
        </div>
      </AccountSection>
    );
  }

  if (orders.length === 0) {
     return (
      <AccountSection title="Recent Orders" icon={<Package className="h-5 w-5 text-primary" />}>
        <div className="text-center p-8 text-muted-foreground">
          <p>You haven't placed any orders yet.</p>
        </div>
      </AccountSection>
    );
  }

  // We only show the 3 most recent orders on this component
  const recentOrders = orders.slice(0, 3);

  return (
    <AccountSection title="Recent Orders" icon={<Package className="h-5 w-5 text-primary" />}>
      <div className="space-y-4">
        {recentOrders.map((order) => {
          const status = statusConfig[order.status] || { label: order.status, icon: Package, color: "bg-gray-100 text-gray-800" };
          const StatusIcon = status.icon;
          
          return (
            <div key={order._id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium font-mono text-sm">#{order._id.slice(-6).toUpperCase()}</h4>
                  <Badge variant="secondary" className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()} • {order.cartItems.length} item(s) • ₹{order.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                View Details
              </Button>
            </div>
          );
        })}
        
        {/* You can create a new page for "All Orders" and link to it here */}
        <Button variant="premium" className="w-full">
          View All Orders
        </Button>
      </div>
    </AccountSection>
  );
}