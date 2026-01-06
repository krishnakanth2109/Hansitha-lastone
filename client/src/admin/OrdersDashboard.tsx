// OrdersList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import OrderNotificationSound from "@/components/OrderNotificationSound";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader,
  Search,
} from "lucide-react";

interface ProductItem {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Address {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface Order {
  _id: string;
  name?: string;
  email: string;
  address?: string | Address;
  products: ProductItem[];
  amount?: number;
  totalAmount?: number; // for compatibility if backend returns amount
  createdAt: string;
  paymentStatus?: "pending" | "paid" | "failed";
  deliveryStatus?: "Processing" | "Shipping" | "Delivered";
}

const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [page, setPage] = useState(1);

  const perPage = 5;
  const API_URL = import.meta.env.VITE_API_URL;

  const formatAddress = (addr?: string | Address) => {
    if (!addr) return "No address provided";
    if (typeof addr === "string") return addr;
    return `${addr.address1 || ""}${addr.address2 ? ", " + addr.address2 : ""}, ${
      addr.city || ""
    }, ${addr.state || ""} - ${addr.postalCode || ""}, ${addr.country || ""}`;
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders`, { withCredentials: true });
      const data: Order[] = response.data;
      setOrders(data);
      setFiltered(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filteredData = [...orders];
    if (fromDate) {
      const [year, month, day] = fromDate.split("-").map(Number);
      const from = new Date(year, month - 1, day).getTime();
      filteredData = filteredData.filter(
        (order) => new Date(order.createdAt).getTime() >= from
      );
    }
    if (toDate) {
      const [year, month, day] = toDate.split("-").map(Number);
      const to = new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
      filteredData = filteredData.filter(
        (order) => new Date(order.createdAt).getTime() <= to
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(
        (order) =>
          order._id.toLowerCase().includes(query) ||
          (order.email || "").toLowerCase().includes(query)
      );
    }
    setFiltered(filteredData);
    setPage(1);
  };

  const handleNewOrder = (newOrder: Order) => {
    toast.success("🛒 New order received!");
    fetchOrders();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, deliveryStatus: newStatus as Order["deliveryStatus"] } : o
        )
      );
      const { data } = await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, deliveryStatus: data.deliveryStatus } : o))
      );
      toast.success(`Status updated to "${newStatus}"`);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
      fetchOrders();
    }
  };

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedOrders = filtered.slice((page - 1) * perPage, page * perPage);

  const handleArrowNavigation = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" && page < totalPages) setPage((p) => p + 1);
    else if (e.key === "ArrowLeft" && page > 1) setPage((p) => p - 1);
  };

  useEffect(() => {
    fetchOrders();
    const socket = io(API_URL, { withCredentials: true });
    socket.on("newOrder", handleNewOrder);
    socket.on("orderStatusUpdated", (payload: { _id: string; deliveryStatus: Order["deliveryStatus"] }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === payload._id ? { ...o, deliveryStatus: payload.deliveryStatus } : o))
      );
    });
    window.addEventListener("keydown", handleArrowNavigation);
    return () => {
      socket.disconnect();
      window.removeEventListener("keydown", handleArrowNavigation);
    };
  }, []);

  useEffect(() => filterOrders(), [fromDate, toDate, searchQuery, orders]);

  useEffect(() => {
    const revenue = filtered.reduce((sum, order) => {
      const itemsTotal = (order.products || []).reduce((total, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 0;
        return total + qty * price;
      }, 0);
      return sum + itemsTotal;
    }, 0);
    setTotalRevenue(revenue);
  }, [filtered]);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-4 sm:p-6">
      <OrderNotificationSound apiUrl={API_URL} onNewOrder={handleNewOrder} />
      <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">🛒 Orders Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-3 rounded-lg shadow text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Total Revenue</p>
          <p className="text-lg sm:text-xl font-bold text-black dark:text-white">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-r from-pink-100 to-pink-200 dark:from-neutral-800 dark:to-neutral-700 p-3 rounded-lg shadow text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Total Orders</p>
          <p className="text-lg sm:text-xl font-bold text-black dark:text-white">{filtered.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm w-full dark:bg-neutral-800"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm w-full dark:bg-neutral-800"
        />
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 border rounded-md text-sm w-full dark:bg-neutral-800"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center text-primary animate-pulse py-10">
          <Loader className="animate-spin w-6 h-6 mr-2" />
          Loading orders...
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">No orders found.</p>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const isOpen = expanded[order._id] || false;
              const status = order.deliveryStatus || "Processing";
              return (
                <div
                  key={order._id}
                  className="border rounded-xl p-4 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 hover:brightness-105 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                      {/* Delivery Status + Dropdown */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${status === "Processing" ? "bg-yellow-100 text-yellow-800" : ""}
                          ${status === "Shipping" ? "bg-blue-100 text-blue-800" : ""}
                          ${status === "Delivered" ? "bg-green-100 text-green-800" : ""}
                        `}
                        >
                          {status}
                        </span>
                        <select
                          value={status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="px-2 py-1 text-sm border rounded-md dark:bg-neutral-800"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipping">Shipping</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>

                      {/* Order Info */}
                      <div
                        className="cursor-pointer flex-1"
                        onClick={() =>
                          setExpanded((prev) => ({ ...prev, [order._id]: !prev[order._id] }))
                        }
                      >
                        <p className="text-xs text-gray-600">Order ID</p>
                        <p className="font-semibold text-primary truncate max-w-full">
                          {order._id}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div
                      className="text-gray-600 dark:text-gray-300 cursor-pointer mt-2 sm:mt-0"
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [order._id]: !prev[order._id] }))
                      }
                    >
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 space-y-3 text-sm">
                      <p><strong>Email:</strong> {order.email}</p>
                      <p><strong>Address:</strong> {formatAddress(order.address)}</p>

                      <div className="grid gap-3 sm:grid-cols-2 mt-2 overflow-x-auto">
                        {(order.products || []).map((item, idx) => (
                          <div
                            key={item._id || item.id || idx}
                            className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded-lg p-2 border min-w-[220px]"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                            <div className="text-sm">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity} × ₹{item.price} = ₹
                                {(item.quantity * item.price).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="mt-3 font-semibold text-green-600 dark:text-green-400">
                        Total: ₹
                        {(order.products || []).reduce(
                          (sum, item) => sum + item.quantity * item.price,
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-center items-center mt-6 space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-200 dark:bg-neutral-700 text-sm font-medium disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-200 dark:bg-neutral-700 text-sm font-medium disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersList;
