import React, { useState } from 'react';
import {
  Menu,
  X,
  Plus,
  LayoutList,
  Image,
  Circle,
  ShoppingCart,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import placeholder components (you'll create these files)
import AddProduct from './AddProduct';
import CarouselManager from './CarouselManager';
import OrdersDashboard from './OrdersDashboard';
import AdminProfile from './AdminProfile';
import AdminCategoryPanel from './AdminCategoryPanel';
import ProductManagementPage from './ProductManagementPage';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Example notification count
  const orderNotificationCount = 5;

  type TabItem = [string, string, React.ReactNode];

  const tabs: TabItem[] = [
    ['add', 'Add Products', <Plus className="w-4 h-4" />],
    ['manage', 'Manage Products', <LayoutList className="w-4 h-4" />],
    ['carousel', 'Carousel Images', <Image className="w-4 h-4" />],
    ['circle', 'Category Circle', <Circle className="w-4 h-4" />],
    [
      'orders',
      'Orders Dashboard',
      <div className="relative">
        <ShoppingCart className="w-4 h-4" />
        {orderNotificationCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {orderNotificationCount}
          </span>
        )}
      </div>,
    ],
    ['profile', 'Admin Profile', <User className="w-4 h-4" />],
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return <AddProduct />;
      case 'manage':
        return (
          <ProductManagementPage
            onEdit={(id) => {
              setEditingProductId(id);
              setActiveTab('edit'); // Note: There is no 'edit' tab in the list. This might be a bug or an incomplete feature.
            }}
          />
        );
      case 'carousel':
        return <CarouselManager />;
      case 'circle':
        return <AdminCategoryPanel />;
      case 'orders':
        return <OrdersDashboard />;
      case 'profile':
        return <AdminProfile />;
      default:
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">Content Area</h2>
                <p>Selected tab content will appear here.</p>
            </div>
        );
    }
  };

  const SidebarLinks = () => (
    <div className="space-y-2 p-6">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin" className="text-2xl font-bold text-white">
          Admin Panel
        </Link>
        <button onClick={() => setIsSidebarOpen(false)}>
          <X className="text-white w-6 h-6" />
        </button>
      </div>
      {tabs.map(([key, label, icon]) => (
        <button
          key={key}
          onClick={() => {
            setActiveTab(key);
            setEditingProductId(null);
            setIsSidebarOpen(false);
          }}
          className={`flex items-center w-full text-left px-4 py-2 rounded-md transition-colors ${
            activeTab === key
              ? 'bg-white text-blue-800 font-semibold'
              : 'text-white hover:bg-blue-600'
          }`}
        >
          {icon}
          <span className="ml-2">{label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 text-gray-900">
      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden" // Only show backdrop on smaller screens
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Slide-in Sidebar for all screen sizes */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 shadow-lg transform-gpu transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarLinks />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b px-4 py-3 shadow-sm">
          <button
            className="text-blue-800"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            Dashboard
          </h1>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 flex-1">
          <div key={activeTab}>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;