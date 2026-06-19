import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Plus,
  LayoutList,
  Megaphone,
  Image,
  Circle,
  ShoppingCart,
  User,
  MessageSquare,
  Home,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// --- IMPORT YOUR PAGE COMPONENTS ---
import AddProduct from './AddProduct';
import CarouselManager from './CarouselManager';
import OrdersDashboard from './OrdersDashboard';
import AdminProfile from './AdminProfile';
import AdminCategoryPanel from './AdminCategoryPanel';
import ProductManagementPage from './ProductManagementPage';
import NotificationsPanel from './NotificationsPanel';
import Dashboard from './Dashboard';
import EditAnnouncement from './EditAnnouncement';
import AdminContactMessages from './AdminContactMessages';
import AdminAbout from './AdminAbout';
const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Detect active tab from URL (e.g., /admin/orders -> 'orders')
  // If the path is just /admin, default to 'dashboard'
  const currentPath = location.pathname.split('/')[2] || 'dashboard';
  
  const [activeTab, setActiveTab] = useState(currentPath);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Sync state if URL changes externally
  useEffect(() => {
    setActiveTab(currentPath);
  }, [currentPath]);

  // --- Fetch Admin User Data ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
        setUserData(res.data.user);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchUserData();
  }, [API_URL]);

  // --- Handle Logout ---
  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ✅ Function to handle Tab Clicks (Updates state AND URL)
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setIsMobileSidebarOpen(false);
    
    // Update the URL without full page reload
    if (key === 'dashboard') {
      navigate('/admin');
    } else {
      navigate(`/admin/${key}`);
    }
  };

  type TabItem = {
    key?: string;
    label?: string;
    icon?: React.ReactNode;
    category?: string;
  };

  // --- Sidebar Configuration ---
  const tabs: TabItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { category: 'Products' },
    { key: 'add', label: 'Add Products', icon: <Plus className="w-5 h-5" /> },
    { key: 'manage', label: 'Manage Products', icon: <LayoutList className="w-5 h-5" /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { category: 'Content' },
    { key: 'announcements', label: 'Announcements', icon: <Megaphone className="w-5 h-5" /> },
    { key: 'carousel', label: 'Banner Images', icon: <Image className="w-5 h-5" /> },
    { key: 'about', label: 'About Images', icon: <Image className="w-5 h-5" /> }, // ✅ ADD THIS
    { key: 'circle', label: 'Circle Category', icon: <Circle className="w-5 h-5" /> },
    { category: 'Communication' },
    { key: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
    { category: 'Settings' },
    { key: 'profile', label: 'Admin Profile', icon: <User className="w-5 h-5" /> },
  ];

  // --- RENDER CONTENT SWITCHER ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'orders': return <OrdersDashboard />;
      case 'add': return <AddProduct />;
      case 'manage': return <ProductManagementPage onEdit={() => {}} />;
      case 'announcements': return <EditAnnouncement />;
      case 'carousel': return <CarouselManager />;
      case 'circle': return <AdminCategoryPanel />;
      case 'messages': return <AdminContactMessages />;
      case 'profile': return <AdminProfile />;
      case 'about': return <AdminAbout />; // ✅ ADD THIS
      default: return <Dashboard />;

    }
  };

  // --- Sidebar Component (Internal) ---
  const SidebarLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4 pt-6">
        <button 
          onClick={() => handleTabChange('dashboard')}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="text-left">
              <h1 className="text-lg font-bold text-white leading-tight">Hansitha Creations</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          )}
        </button>
        {!isMobile && !isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {!isSidebarCollapsed && (
        <div className="px-4 py-3 mx-3 rounded-xl bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center overflow-hidden">
              {userData?.avatar ? (
                <img src={userData.avatar} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold text-white text-sm truncate">{userData?.name || 'Admin'}</h3>
              <p className="text-xs text-gray-400 truncate">{userData?.email || 'admin@system.com'}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="space-y-1 pb-6">
        {tabs.map((tab, idx) => {
          if (tab.category) {
            return !isSidebarCollapsed ? (
              <div key={`cat-${idx}`} className="px-4 pt-4 pb-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{tab.category}</p>
              </div>
            ) : null;
          }

          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => tab.key && handleTabChange(tab.key)}
              className={`flex items-center w-full text-left transition-all duration-200 ${
                isSidebarCollapsed ? 'px-4 py-3 justify-center' : 'px-4 py-2.5 mx-3 w-[calc(100%-24px)]'
              } ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 font-semibold rounded-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 rounded-lg'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && isSidebarCollapsed && (
                  <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full"></div>
                )}
              </div>
              {!isSidebarCollapsed && <span className="ml-3 text-sm">{tab.label}</span>}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full text-left transition-all duration-200 ${
              isSidebarCollapsed ? 'px-4 py-3 justify-center' : 'px-4 py-2.5 mx-3 w-[calc(100%-24px)]'
            } text-red-400 hover:bg-red-500/10 rounded-lg font-medium`}
          >
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      
      <aside
        className={`hidden lg:flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } bg-[#0F172A] shadow-xl z-20 h-full overflow-y-auto custom-scrollbar`}
      >
        <SidebarLinks />
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-all z-50"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </aside>

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] lg:hidden transform transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl overflow-y-auto`}
      >
        <SidebarLinks isMobile />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors p-1"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                {activeTab === 'dashboard' 
                  ? 'Dashboard Overview' 
                  : tabs.find(t => t.key === activeTab)?.label || activeTab.replace(/^\w/, (c) => c.toUpperCase())}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* <NotificationsPanel /> */}

            <div className="hidden md:block h-6 w-px bg-gray-300"></div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-700 leading-none mb-1">
                  {userData?.name?.split(' ')[0] || 'Admin'}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {userData?.role || 'Administrator'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                {userData?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50 relative">
          <div key={activeTab} className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;