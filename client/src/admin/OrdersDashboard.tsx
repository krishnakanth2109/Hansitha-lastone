import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { 
  ChevronDown, ChevronUp, Loader, Search, Save, 
  CheckCircle, XCircle, RefreshCw, Truck, Package
} from "lucide-react";

// --- INTERFACES ---
interface UserInfo {
  _id: string;
  name: string;
  email: string;
}

interface CartItem {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Address {
  name?: string;
  houseNumber?: string;
  street?: string;
  landmark?: string;
  area?: string;
  city?: string;
  pincode?: string;
  state?: string;
  country?: string;
}

interface TrackingDetails {
  awbCode?: string;
  courierName?: string;
}

interface Order {
  _id: string;
  user?: UserInfo | null;
  name?: string;
  email: string;
  address: Address;
  cartItems: CartItem[];
  totalAmount: number;
  createdAt: string;
  paymentStatus: "pending" | "paid" | "failed";
  adminStatus: "pending" | "approved" | "rejected" | "shipping_error";
  status: "Placed" | "Processing" | "Shipped" | "In Transit" | "Delivered" | "Undelivered" | "Return In Progress" | "Returned" | "Refunded" | "Cancelled";
  // ✅ FIX: Support both field names — backend uses trackingDetails, we accept both
  trackingDetails?: TrackingDetails;
  shipmentDetails?: TrackingDetails;
}

const OrdersDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const perPage = 10;
  const API_URL = import.meta.env.VITE_API_URL;
  
  const socketRef = useRef<Socket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Helper: normalise both trackingDetails and shipmentDetails into one
  const normaliseOrder = (order: any): Order => ({
    ...order,
    trackingDetails: order.trackingDetails || order.shipmentDetails || {},
    shipmentDetails: order.trackingDetails || order.shipmentDetails || {},
  });

  const updateOrderInState = (updatedOrder: any) => {
    const normalised = normaliseOrder(updatedOrder);
    setOrders(prev => prev.map(o => (o._id === normalised._id ? normalised : o)));
  };

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axios.get(`${API_URL}/api/admin/orders`, { withCredentials: true });
      // Normalise all orders on fetch
      const normalisedOrders = response.data.map(normaliseOrder);
      setOrders(normalisedOrders);
      
      if (silent) {
        console.log('✅ Orders auto-refreshed:', normalisedOrders.length);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!silent) {
        toast.error("Failed to fetch orders. Are you an Admin?");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [API_URL]);

  const handleManualRefresh = () => {
    toast.success('Refreshing orders...');
    fetchOrders(false);
  };

  // Socket.IO Connection
  useEffect(() => {
    console.log('🔌 Connecting to Socket.IO...');
    const socket: Socket = io(API_URL, { 
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      setSocketConnected(true);
      toast.success('Real-time updates enabled');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setSocketConnected(false);
    });

    // ✅ New order from webhook — add to top of list
    socket.on("newOrder", (newOrder: any) => {
      console.log('🔔 New order received:', newOrder._id);
      const normalised = normaliseOrder(newOrder);
      setOrders(current => {
        // Avoid duplicates — replace if exists, otherwise prepend
        const exists = current.find(o => o._id === normalised._id);
        if (exists) return current.map(o => o._id === normalised._id ? normalised : o);
        return [normalised, ...current];
      });
      toast.success(`🎉 New order #${newOrder._id.slice(-6)} received!`);
    });

    // ✅ Payment status changed (paid/failed) from webhook
    socket.on("orderUpdated", (updatedOrder: any) => {
      console.log('🔔 orderUpdated event:', updatedOrder._id, updatedOrder.paymentStatus);
      updateOrderInState(updatedOrder);
      toast(`Order #${updatedOrder._id.slice(-6)}: Payment ${updatedOrder.paymentStatus?.toUpperCase()}`);
    });

    // ✅ Admin actions (approve/reject/status/shipping)
    socket.on("orderStatusUpdated", (updatedOrder: any) => {
      console.log('🔔 orderStatusUpdated event:', updatedOrder._id);
      updateOrderInState(updatedOrder);
    });

    // ✅ Cron job expired some orders
    socket.on("ordersExpired", ({ count }: { count: number }) => {
      console.log(`⏰ ${count} pending order(s) auto-expired`);
      fetchOrders(true); // Silently refresh to get updated list
    });
    
    return () => {
      console.log('🔌 Disconnecting Socket.IO...');
      socket.disconnect();
    };
  }, [API_URL]);

  // Initial fetch + auto-refresh every 15 seconds
  useEffect(() => {
    fetchOrders();

    refreshIntervalRef.current = setInterval(() => {
      fetchOrders(true);
    }, 15000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchOrders]);

  // --- HANDLER FUNCTIONS ---
  
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/orders/${orderId}/status`, { status: newStatus }, { withCredentials: true });
      updateOrderInState(res.data);
      toast.success(`Status updated to "${newStatus}"`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      const res = await axios.patch(`${API_URL}/api/admin/orders/${orderId}/approve`, {}, { withCredentials: true });
      updateOrderInState(res.data);
      toast.success("✅ Order approved!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve order.");
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleRejectOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure? This will restock items and cancel the order.")) return;
    setProcessingId(orderId);
    try {
      const res = await axios.patch(`${API_URL}/api/admin/orders/${orderId}/reject`, {}, { withCredentials: true });
      updateOrderInState(res.data);
      toast.success("Order rejected & items restocked.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject order.");
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleShippingUpdate = async (orderId: string, awbCode: string, courierName: string) => {
    if (!awbCode) return toast.error("Tracking ID (AWB) is required.");
    setProcessingId(orderId);
    try {
      const res = await axios.patch(`${API_URL}/api/admin/orders/${orderId}/shipping`, { awbCode, courierName }, { withCredentials: true });
      updateOrderInState(res.data);
      toast.success("🚚 Shipping details saved!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save shipping details.");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    const filtered = orders.filter(order => {
      const customerName = order.user?.name || order.name || '';
      const customerEmail = order.user?.email || order.email || '';
      const query = searchQuery.toLowerCase();
      return (
        order._id.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query)
      );
    });
    setFilteredOrders(filtered);
    setPage(1);
  }, [searchQuery, orders]);

  useEffect(() => {
    const revenue = orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    setTotalRevenue(revenue);
  }, [orders]);

  const formatAddress = (addr: Address) => {
    if (!addr) return "No address provided";
    if (addr.houseNumber || addr.street) {
        return `${addr.houseNumber || ''}, ${addr.street || ''}, ${addr.area || ''}, ${addr.city || ''} - ${addr.pincode || ''}`;
    }
    return `${addr.city || ''}, ${addr.state || ''}, ${addr.pincode || ''}`;
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
        paid: "bg-green-100 text-green-700 border-green-200",
        pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        failed: "bg-red-100 text-red-700 border-red-200"
    };
    const style = styles[status] || styles.pending;
    return (
        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border rounded-full ${style}`}>
            {status || 'pending'}
        </span>
    );
  };

  const totalPages = Math.ceil(filteredOrders.length / perPage);
  const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Orders Dashboard</h2>
            <p className="text-xs text-gray-500 mt-1">
                Real-time connection: <span className={socketConnected ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{socketConnected ? '● Active' : '● Disconnected'}</span>
            </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <p className="text-sm text-gray-600">Total Revenue (Paid)</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-purple-600">{orders.length}</p>
          </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />
      </div>

      {/* Content Area */}
      {loading ? (
          <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
      ) : paginatedOrders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-lg font-medium text-gray-600">No orders found</p>
              <p className="text-sm text-gray-400">Try adjusting your search terms.</p>
          </div>
      ) : (
          <div className="space-y-4">
              {paginatedOrders.map((order) => (
                  <OrderCard
                      key={order._id}
                      order={order}
                      expanded={expanded[order._id]}
                      onToggle={() => setExpanded(prev => ({ ...prev, [order._id]: !prev[order._id] }))}
                      onStatusChange={handleStatusChange}
                      onApprove={handleApproveOrder}
                      onReject={handleRejectOrder}
                      onShippingUpdate={handleShippingUpdate}
                      formatAddress={formatAddress}
                      getPaymentBadge={getPaymentBadge}
                      processing={processingId === order._id}
                  />
              ))}
          </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
              <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
              >
                  Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600 flex items-center">Page {page} of {totalPages}</span>
              <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
              >
                  Next
              </button>
          </div>
      )}
    </div>
  );
};

// --- SUB COMPONENT: ORDER CARD ---
interface OrderCardProps {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: Order['status']) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onShippingUpdate: (id: string, awb: string, courier: string) => void;
  formatAddress: (addr: Address) => string;
  getPaymentBadge: (status: string) => JSX.Element;
  processing: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order, expanded, onToggle, onStatusChange, onApprove, onReject,
  onShippingUpdate, formatAddress, getPaymentBadge, processing
}) => {
  // ✅ FIX: Read from trackingDetails (DB field name), fall back to shipmentDetails
  const tracking = order.trackingDetails || order.shipmentDetails || {};
  const [awbCode, setAwbCode] = useState(tracking.awbCode || '');
  const [courierName, setCourierName] = useState(tracking.courierName || '');

  // Keep local state in sync when order prop updates (e.g. after socket event)
  useEffect(() => {
    const t = order.trackingDetails || order.shipmentDetails || {};
    setAwbCode(t.awbCode || '');
    setCourierName(t.courierName || '');
  }, [order.trackingDetails, order.shipmentDetails]);

  const handleSaveShipping = () => {
    if (!awbCode.trim()) {
      return;
    }
    onShippingUpdate(order._id, awbCode.trim(), courierName.trim());
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${expanded ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}>
      <div className="p-4 bg-white flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Order ID</p>
            <p className="font-mono font-bold text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Customer</p>
            <p className="font-medium text-sm text-gray-800 truncate">{order.user?.name || order.name || 'Guest'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Amount</p>
            <p className="font-bold text-sm text-gray-800">₹{order.totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Payment</p>
            {getPaymentBadge(order.paymentStatus)}
          </div>
        </div>
        <div className="ml-4 pl-4 border-l border-gray-100">
           {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm mb-2">Customer Info</h4>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                    <p className="font-medium">{order.user?.name || order.name}</p>
                    <p className="text-gray-500">{order.email}</p>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-gray-600">{formatAddress(order.address)}</p>
                    </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Items ({order.cartItems.length})</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {order.cartItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded bg-gray-100" />
                        <div className="flex-1">
                            <p className="font-medium text-xs line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="font-semibold text-xs">₹{(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
               {/* Order Status Controls */}
               <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Order Status</h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-gray-500">Current: <span className="font-bold text-gray-800">{order.status}</span></span>
                        <span className="text-xs text-gray-500">Admin: <span className="font-bold text-gray-800 uppercase">{order.adminStatus}</span></span>
                    </div>

                    <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order._id, e.target.value as Order['status'])}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                    >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Undelivered">Undelivered</option>
                        <option value="Return In Progress">Return In Progress</option>
                        <option value="Returned">Returned</option>
                        <option value="Refunded">Refunded</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
               </div>

               {/* Approve / Reject — only for paid + pending orders */}
               {order.adminStatus === 'pending' && order.paymentStatus === 'paid' && (
                <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Pending Actions</h4>
                    <div className="flex gap-3">
                    <button
                        onClick={() => onApprove(order._id)}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                        {processing ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve
                    </button>
                    <button
                        onClick={() => onReject(order._id)}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                        {processing ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                    </button>
                    </div>
                </div>
              )}

              {/* Notice for unpaid pending orders */}
              {order.adminStatus === 'pending' && order.paymentStatus !== 'paid' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                  ⚠️ Cannot approve — payment status is <strong>{order.paymentStatus}</strong>. Waiting for payment confirmation.
                </div>
              )}

              {/* Shipping Form — only available after approval */}
              {order.adminStatus === 'approved' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-800 text-sm mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Shipping & Tracking
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Courier Name (e.g. BlueDart)"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="AWB / Tracking Number *"
                      value={awbCode}
                      onChange={(e) => setAwbCode(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={handleSaveShipping}
                        disabled={processing || !awbCode.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium shadow-sm"
                    >
                        {processing ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Tracking Info
                    </button>
                    {/* Show existing tracking if present */}
                    {tracking.awbCode && (
                      <p className="text-xs text-blue-600 mt-1">
                        Current: {tracking.courierName || 'Courier'} — AWB: <strong>{tracking.awbCode}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersDashboard;