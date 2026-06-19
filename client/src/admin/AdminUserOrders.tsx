import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Search, User, MapPin, Package, Calendar, ChevronRight, ChevronDown, 
  ArrowLeft, Mail, Shield, Loader2, Eye, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client'; // You may need to install: npm install socket.io-client

const API_URL = import.meta.env.VITE_API_URL;

// --- Interfaces ---
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Address {
  _id: string;
  name: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  cartItems: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
}

const AdminUserOrders = () => {
  // State
  const [view, setView] = useState<'list' | 'details'>('list');
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selected User Data
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Socket.IO and polling refs
  const socketRef = useRef<any>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch All Users on Mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // 2. Socket.IO Connection for Real-time Updates
  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io(API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to Socket.IO');
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO');
    });

    // Listen for order updates
    socketRef.current.on('orderUpdated', (updatedOrder: Order) => {
      console.log('🔔 Order updated via Socket.IO:', updatedOrder);
      
      // Update the order in the list if we're viewing the same user
      if (selectedUser && updatedOrder) {
        setUserOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
        
        // Show toast notification
        toast.success(`Order #${updatedOrder._id.slice(-6)} updated: ${updatedOrder.paymentStatus}`);
      }
    });

    socketRef.current.on('newOrder', (newOrder: Order) => {
      console.log('🔔 New order via Socket.IO:', newOrder);
      
      // If we're viewing the user who made this order, add it to their list
      if (selectedUser && newOrder && newOrder.user === selectedUser._id) {
        setUserOrders(prevOrders => [newOrder, ...prevOrders]);
        toast.success(`New order #${newOrder._id.slice(-6)} received!`);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [API_URL, selectedUser]);

  // 3. Auto-refresh orders every 10 seconds when viewing details
  useEffect(() => {
    if (view === 'details' && selectedUser) {
      // Initial fetch
      fetchUserOrders(selectedUser._id);

      // Set up polling interval
      refreshIntervalRef.current = setInterval(() => {
        console.log('🔄 Auto-refreshing orders...');
        fetchUserOrders(selectedUser._id, true); // Silent refresh
      }, 10000); // Every 10 seconds

      // Cleanup interval on unmount or when view changes
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [view, selectedUser]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users/all`, { withCredentials: true });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch only orders (for refresh)
  const fetchUserOrders = async (userId: string, silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      
      const orderRes = await axios.get(
        `${API_URL}/api/users/admin/${userId}/orders`, 
        { withCredentials: true }
      );
      
      setUserOrders(orderRes.data);
      console.log('✅ Orders refreshed:', orderRes.data.length);
      
      if (!silent) {
        toast.success('Orders refreshed!');
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      if (!silent) {
        toast.error("Failed to refresh orders");
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // 2. Client-side Filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // 3. View Details Handler
  const handleViewDetails = async (user: UserData) => {
    setSelectedUser(user);
    setView('details');
    setDetailsLoading(true);

    try {
      // Fetch Addresses & Orders in parallel
      const [addrRes, orderRes] = await Promise.all([
        axios.get(`${API_URL}/api/users/admin/${user._id}/addresses`, { withCredentials: true }),
        axios.get(`${API_URL}/api/users/admin/${user._id}/orders`, { withCredentials: true })
      ]);

      setUserAddresses(addrRes.data);
      setUserOrders(orderRes.data);
      
      console.log('📦 Fetched orders:', orderRes.data);
    } catch (error) {
      toast.error("Failed to fetch user details");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Manual refresh button handler
  const handleManualRefresh = () => {
    if (selectedUser) {
      fetchUserOrders(selectedUser._id);
    }
  };

  // Helper for Status Badge Color
  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch(normalizedStatus) {
      case 'paid': 
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'failed': 
        return 'bg-red-100 text-red-700 border-red-300';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // --- RENDER: USER LIST TABLE ---
  if (view === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" /> User Database
          </h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        user.role === 'superadmin' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <Shield className="w-3 h-3 inline mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-10 text-slate-500">No users found.</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- RENDER: USER DETAILS VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setView('list')}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users List
        </button>
        
        {/* Manual Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      {detailsLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : selectedUser && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-500">
          
          {/* Left Panel: Info & Address */}
          <div className="space-y-6 xl:col-span-1">
            {/* User Profile Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedUser.name}</h2>
                  <div className="flex items-center text-slate-500 text-sm mt-1">
                    <Mail className="w-3 h-3 mr-1.5" /> {selectedUser.email}
                  </div>
                  <div className="flex items-center text-slate-500 text-sm mt-1">
                    <Shield className="w-3 h-3 mr-1.5" /> {selectedUser.role}
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">User ID</span>
                  <span className="font-mono text-slate-700 bg-slate-50 px-2 rounded">{selectedUser._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-slate-500">Joined On</span>
                  <span className="text-slate-700">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" /> Saved Addresses
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {userAddresses.length === 0 ? (
                  <div className="text-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">No addresses found.</p>
                  </div>
                ) : (
                  userAddresses.map((addr) => (
                    <div key={addr._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm hover:border-indigo-200 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{addr.name}</p>
                          <p className="text-slate-600 mt-1">{addr.houseNumber}, {addr.street}</p>
                          <p className="text-slate-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Orders */}
          <div className="xl:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-500" /> Order History
                  <span className="text-xs text-slate-400 font-normal">(Auto-refreshes every 10s)</span>
                </h3>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  {userOrders.length} Orders
                </span>
              </div>

              <div className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No orders found for this user.</p>
                  </div>
                ) : (
                  userOrders.map((order) => (
                    <div key={order._id} className="border border-slate-200 rounded-xl overflow-hidden transition-all hover:shadow-md hover:border-indigo-200">
                      {/* Order Summary Row */}
                      <div 
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer transition-colors ${expandedOrder === order._id ? 'bg-indigo-50/50' : 'bg-white hover:bg-slate-50'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:gap-8 gap-2">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Order ID</p>
                            <p className="font-mono text-sm font-medium text-slate-700">#{order._id.slice(-6)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Date</p>
                            <div className="flex items-center gap-1 text-sm text-slate-700">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Amount</p>
                            <p className="font-bold text-slate-800">₹{order.totalAmount.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-3 sm:mt-0">
                          {/* Payment Status Badge */}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus?.toUpperCase() || 'PENDING'}
                          </span>
                          {/* Order Status Badge */}
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-sm">
                            {order.status}
                          </span>
                          {expandedOrder === order._id ? <ChevronDown className="w-5 h-5 text-indigo-500" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </div>
                      </div>

                      {/* Expanded Order Items */}
                      {expandedOrder === order._id && (
                        <div className="bg-slate-50 p-4 border-t border-slate-200 animate-in slide-in-from-top-2 duration-200">
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <Package className="w-3 h-3" /> Items Purchased
                          </h4>
                          <div className="grid gap-3">
                            {order.cartItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <div className="h-12 w-12 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-medium text-slate-700 text-sm whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserOrders;