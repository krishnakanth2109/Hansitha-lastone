import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Plus,
  LayoutList,
  Megaphone ,
  Image,
  Circle,
  ShoppingCart,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { io as socketIOClient } from 'socket.io-client';

const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(true);
  const [orderNotificationCount, setOrderNotificationCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch initial order count
    const fetchOrderCount = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/count`, {
          withCredentials: true,
        });
        setOrderNotificationCount(res.data.count);
      } catch (err) {
        console.error('Failed to fetch order count', err);
      }
    };

    fetchOrderCount();

    // Setup WebSocket
    const socket = socketIOClient(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    socket.on('newOrder', () => {
      setOrderNotificationCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  type TabItem = {
    key: string;
    label: string;
    icon: React.ReactNode;
    path: string;
  };

  const tabs: TabItem[] = [
    {
      key: 'add',
      label: 'Add Products',
      icon: <Plus className="w-4 h-4 mr-2" />,
      path: '/admin/add',
    },
    {
      key: 'manage',
      label: 'Manage Products',
      icon: <LayoutList className="w-4 h-4 mr-2" />,
      path: '/admin/manage',
    },
    {
      key: 'announcements',
      label: 'Anouncement Manage',
      icon: <Megaphone  className="w-4 h-4 mr-2" />,
      path: '/admin/announcements',
    },
    {
      key: 'carousel',
      label: 'Banner Images',
      icon: <Image className="w-4 h-4 mr-2" />,
      path: '/admin/carousel',
    },
    {
      key: 'circle',
      label: 'Circle Category',
      icon: <Circle className="w-4 h-4 mr-2" />,
      path: '/admin/circle',
    },
    {
      key: 'orders',
      label: 'Orders Dashboard',
      icon: (
        <div className="relative mr-2">
          <ShoppingCart className="w-4 h-4" />
          {orderNotificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {orderNotificationCount}
            </span>
          )}
        </div>
      ),
      path: '/admin/orders',
    },
    {
      key: 'profile',
      label: 'Admin Profile',
      icon: <User className="w-4 h-4 mr-2" />,
      path: '/admin/profile',
    },
  ];

  const SidebarLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin" className="text-2xl font-bold text-white">
          Admin Panel
        </Link>
        {isMobile && (
          <button onClick={() => setIsMobileSidebarOpen(false)}>
            <X className="text-white w-6 h-6" />
          </button>
        )}
      </div>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.key}
            onClick={() => {
              navigate(tab.path);
              setIsMobileSidebarOpen(false);
            }}
            className={`flex items-center w-full text-left px-4 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-white text-blue-800 font-semibold'
                : 'text-white hover:bg-blue-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 text-gray-900">
      {/* Desktop Sidebar */}
      {isDesktopSidebarVisible && (
        <aside className="hidden sm:flex flex-col w-64 bg-blue-800 p-6 shadow-lg">
          <SidebarLinks />
        </aside>
      )}

      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Slide-in */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 p-6 sm:hidden transform transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarLinks isMobile />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between bg-white border-b px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              className="sm:hidden text-blue-800"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu />
            </button>
            <button
              className="hidden sm:inline-flex items-center text-blue-800"
              onClick={() => setIsDesktopSidebarVisible(!isDesktopSidebarVisible)}
            >
              {isDesktopSidebarVisible ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4 sm:p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
