import React, { forwardRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  X, Home, Store, Info, Phone, ArrowLeft, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCategoryPage?: boolean;
  categories?: string[];
}

// Added Category interface based on your backend model
interface Category {
  _id: string;
  name: string;
  image?: string;
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ isOpen, onClose, isCategoryPage = false, categories = [] }, ref) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'fabrics'>(isCategoryPage ? 'categories' : 'menu');

    // State for dynamic fabrics/categories
    const [fetchedFabrics, setFetchedFabrics] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const menuItems = [
      { icon: Home, label: 'Home', href: '/' },
      { icon: Store, label: 'Shop', href: '/shop' },
      { icon: Info, label: 'About Us', href: '/about' },
      { icon: Phone, label: 'Contact Us', href: '/contact' },
    ];

    const mainCategories = [
      { label: 'Fabrics', type: 'fabrics' },
      { label: 'New Arrivals', href: '/new-arrivals' },
      { label: 'CEO Collections', href: '/ceo-collections' },
    ];

    // Fetch categories from backend when sidebar opens
    useEffect(() => {
      if (isOpen && fetchedFabrics.length === 0) {
        const fetchCategories = async () => {
          setIsLoading(true);
          try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
            setFetchedFabrics(res.data);
          } catch (error) {
            console.error('Failed to fetch categories:', error);
          } finally {
            setIsLoading(false);
          }
        };

        fetchCategories();
      }
    }, [isOpen, fetchedFabrics.length]);

    useEffect(() => {
      if (!isOpen) setActiveTab('menu');
    }, [isOpen]);

    // ✅ Outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const sidebar = (ref as React.RefObject<HTMLDivElement>)?.current;
        if (sidebar && !sidebar.contains(event.target as Node)) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, onClose, ref]);

    // Utility to format URLs properly (e.g. "Cotton Silk" -> "cotton-silk")
    const formatSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

    if (!isOpen) return null;

    return ReactDOM.createPortal(
      <div
        ref={ref}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Hansitha Creations</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'menu'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'categories' || activeTab === 'fabrics'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Categories
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'menu' && (
            <div className="p-4 space-y-2">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 group"
                >
                  <item.icon className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                  <span className="text-gray-800 group-hover:text-purple-600 font-medium">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="p-4 space-y-2 animate-fadeInRight">
              {isCategoryPage ? (
                categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(`/fabrics/${formatSlug(category)}`);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 text-gray-800 hover:text-purple-600 font-medium"
                  >
                    {category}
                  </button>
                ))
              ) : (
                mainCategories.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (item.type === 'fabrics') {
                        setActiveTab('fabrics');
                      } else {
                        navigate(item.href!);
                        onClose();
                      }
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 text-gray-800 hover:text-purple-600 font-medium"
                  >
                    {item.label}
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'fabrics' && (
            <div className="p-4 space-y-2 animate-fadeInRight">
              <button
                onClick={() => setActiveTab('categories')}
                className="flex items-center space-x-2 text-sm text-purple-600 mb-4 hover:text-purple-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Categories</span>
              </button>

              {/* DYNAMIC FABRICS RENDER */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading fabrics...</span>
                </div>
              ) : fetchedFabrics.length > 0 ? (
                fetchedFabrics.map((fabric) => (
                  <button
                    key={fabric._id}
                    onClick={() => {
                      navigate(`/fabrics/${formatSlug(fabric.name)}`);
                      onClose();
                    }}
                    className="w-full flex items-center space-x-3 text-left p-3 rounded-lg hover:bg-gray-100 text-gray-800 hover:text-purple-600 font-medium transition-colors"
                  >
                    {fabric.image && (
                      <img 
                        src={fabric.image} 
                        alt={fabric.name} 
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    <span>{fabric.name}</span>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No fabrics found.</p>
              )}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }
);

export default Sidebar;