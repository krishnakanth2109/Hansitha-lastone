import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity,
  PieChart as PieChartIcon, 
  Download,
  MoreVertical
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// --- Interfaces ---
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  revenueChange: number;
  ordersChange: number;
}

interface OrderData {
  _id: string;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  adminStatus: string;
  user?: {
    name: string;
    email: string;
  };
}

interface ProductData {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CategoryData {
  _id: string;
  name: string;
  image: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const Dashboard = () => {
  // --- State ---
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    revenueChange: 0,
    ordersChange: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  const API_URL = import.meta.env.VITE_API_URL;

  // Chart Colors
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28'];

  // --- Effects ---
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, usersRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/orders`, { withCredentials: true }),
        axios.get(`${API_URL}/api/products`, { withCredentials: true }),
        // ✅ FIXED: Now fetching ALL users from the correct backend endpoint
        axios.get(`${API_URL}/api/users/all`, { withCredentials: true }), 
        axios.get(`${API_URL}/api/categories`, { withCredentials: true })
      ]);

      // Safety checks: ensure data is array
      const orders: OrderData[] = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const products: ProductData[] = Array.isArray(productsRes.data) ? productsRes.data : [];
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const categories: CategoryData[] = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

      // 1. Calculate Revenue & Stats
      const totalRevenue = orders.reduce((sum, order) => 
        (order.paymentStatus === 'paid' || order.status === 'Delivered') ? sum + order.totalAmount : sum, 0
      );
      
      const pendingOrders = orders.filter(order => order.adminStatus === 'pending').length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length, // ✅ This will now reflect the real user count
        pendingOrders,
        revenueChange: 12.5, 
        ordersChange: 8.3
      });

      // 2. Process Category Distribution
      const distData = categories.map((cat, index) => {
        const count = products.filter(p => p.category === cat.name || p.category === cat._id).length;
        return {
          name: cat.name,
          value: count,
          color: COLORS[index % COLORS.length]
        };
      }).filter(item => item.value > 0);

      setCategoryDistribution(distData);

      // 3. Get Recent Orders (First 5)
      setRecentOrders(orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));

      // 4. Get Top Products (by price for now)
      setTopProducts(products.sort((a, b) => b.price - a.price).slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock Revenue Data (Kept the same as requested)
  const revenueData = [
    { name: 'Mon', revenue: 4000, orders: 24 },
    { name: 'Tue', revenue: 3000, orders: 13 },
    { name: 'Wed', revenue: 2000, orders: 8 },
    { name: 'Thu', revenue: 2780, orders: 11 },
    { name: 'Fri', revenue: 1890, orders: 6 },
    { name: 'Sat', revenue: 2390, orders: 15 },
    { name: 'Sun', revenue: 3490, orders: 19 },
  ];

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: stats.ordersChange,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      change: 4.2,
      icon: <Package className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      change: 15.7,
      icon: <Users className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      textColor: 'text-orange-700'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Store Performance Analytics</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                <div className="text-white">{card.icon}</div>
              </div>
              <div className={`flex items-center text-sm font-semibold ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {card.change >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                {Math.abs(card.change)}%
              </div>
            </div>
            <h3 className={`text-2xl font-bold mt-4 ${card.textColor}`}>{card.value}</h3>
            <p className="text-gray-600 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue & Orders</h3>
              <p className="text-gray-600 text-sm">Weekly Comparison</p>
            </div>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Product Categories</h3>
              <p className="text-gray-600 text-sm">Inventory Distribution</p>
            </div>
          </div>
          <div className="h-80">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} Products`, name]} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No products found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-gray-600 text-sm">Latest 5 transactions</p>
            </div>
            <span className="text-xs text-gray-400 italic">Go to 'Orders' tab for full list</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 text-sm font-semibold text-gray-600">ID</th>
                  <th className="py-3 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="py-3 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="py-3 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100">
                    <td className="py-3 text-xs font-mono text-gray-500">#{order._id.slice(-6)}</td>
                    <td className="py-3 text-sm font-medium">{order.user?.name || 'Guest'}</td>
                    <td className="py-3 text-sm">₹{order.totalAmount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
          </div>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;