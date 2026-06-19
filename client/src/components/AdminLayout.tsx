import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu, X, Plus, LayoutList, Megaphone, Image, Circle, 
  ShoppingCart, User, Bell, MessageSquare, Home, BarChart3, 
  LogOut, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import axios from 'axios';
import { io as socketIOClient } from 'socket.io-client';
import toast from 'react-hot-toast';
import NotificationsPanel from '../admin/NotificationsPanel';

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifRes, countRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/api/notifications`, { withCredentials: true }),
          axios.get(`${API_URL}/api/notifications/unread-count`, { withCredentials: true }),
          axios.get(`${API_URL}/api/auth/me`, { withCredentials: true })
        ]);
        
        setNotifications(notifRes.data);
        setUnreadCount(countRes.data.count);
        setUserData(userRes.data.user);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      }
    };

    fetchData();

    const socket = socketIOClient(API_URL, { withCredentials: true });
    socket.on('new_notification', (newNotification: Notification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast.success(newNotification.message, { icon: '🔔', duration: 4000 });
    });

    return () => {
      socket.disconnect();
    };
  }, [API_URL]);

  const handleMarkAllAsRead = async () => {
    setUnreadCount(0);
    setIsNotificationsOpen(false);
    try {
      await axios.patch(`${API_URL}/api/notifications/mark-all-read`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      toast.error("Sync failed");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  type TabItem = {
    key?: string;
    label?: string;
    icon?: React.ReactNode;
    path?: string;
    category?: string;
  };

  const tabs: TabItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} />, path: '/admin/dashboard' },
    
    { category: 'Products' },
    { key: 'add', label: 'Add Products', icon: <Plus size={20} />, path: '/admin/add' },
    { key: 'manage', label: 'Manage Products', icon: <LayoutList size={20} />, path: '/admin/manage' },
    { key: 'orders', label: 'Orders', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    
    { category: 'Content' },
    { key: 'announcements', label: 'Announcements', icon: <Megaphone size={20} />, path: '/admin/announcements' },
    { key: 'carousel', label: 'Banners', icon: <Image size={20} />, path: '/admin/carousel' },
    { key: 'about', label: 'About Images', icon: <Image size={20} />, path: '/admin/about' }, // ✅ ADDED THIS LINE
    { key: 'circle', label: 'Categories', icon: <Circle size={20} />, path: '/admin/circle' },
    
    { category: 'Communication' },
    { key: 'messages', label: 'Messages', icon: <MessageSquare size={20} />, path: '/admin/messages' },
    
    { category: 'Settings' },
    { key: 'profile', label: 'Profile', icon: <User size={20} />, path: '/admin/profile' },
    { key: 'users', label: 'User Data', icon: <User size={20} />, path: '/admin/users' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white shadow-xl transition-all duration-300">
      
      <div className={`flex items-center h-16 px-4 border-b border-slate-800 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Link to="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[40px] h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Home className="w-5 h-5 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <span className="font-bold text-lg leading-tight whitespace-nowrap">Hansitha</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest">Admin</span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1 px-3">
          {tabs.map((tab, idx) => {
            if (tab.category) {
              return isSidebarCollapsed ? (
                <div key={idx} className="my-4 h-px bg-slate-800 mx-2" />
              ) : (
                <div key={idx} className="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider animate-in fade-in">
                  {tab.category}
                </div>
              );
            }

            const isActive = location.pathname === tab.path || 
              (tab.path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/'));
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if(tab.path) navigate(tab.path);
                  setIsMobileSidebarOpen(false);
                }}
                title={isSidebarCollapsed ? tab.label : ''}
                className={`group flex items-center w-full p-3 rounded-xl transition-all duration-200 mb-1
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                  ${isSidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                  {tab.icon}
                </div>
                
                {!isSidebarCollapsed && (
                  <span className="ml-3 font-medium text-sm whitespace-nowrap">{tab.label}</span>
                )}
                
                {isSidebarCollapsed && isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shrink-0">
            <span className="font-bold text-white">
              {userData?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in">
              <p className="text-sm font-semibold text-white truncate">{userData?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-400 truncate">{userData?.email}</p>
            </div>
          )}
          
          {!isSidebarCollapsed && (
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      <aside 
        className={`hidden lg:block h-full transition-all duration-300 ease-in-out z-20
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <SidebarContent />
      </aside>

      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 transition-transform duration-300 lg:hidden ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute right-4 top-4">
          <button onClick={() => setIsMobileSidebarOpen(false)} className="text-white">
            <X size={24} />
          </button>
        </div>
        <SidebarContent />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <button 
              className="hidden lg:flex items-center justify-center p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-colors"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>

            <h1 className="text-lg font-semibold text-slate-800 capitalize hidden sm:block">
              {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className="p-2 rounded-full text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              <NotificationsPanel
                isOpen={isNotificationsOpen}
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700">{userData?.name}</p>
                <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full capitalize">
                  {userData?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* ✅ THIS OUTLET IS CRITICAL FOR APP.TSX ROUTES TO WORK */}
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;