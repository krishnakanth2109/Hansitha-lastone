// src/components/SearchSidebar.tsx
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Skeleton Loader
const SkeletonItem = () => (
  <div className="w-full px-4 py-2 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
    <div className="h-3 bg-gray-100 rounded w-1/2" />
  </div>
);

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchSidebar = ({ isOpen, onClose }: SearchSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/search?q=${searchQuery}`
        );
        const data = await res.json();
        setSearchResults(data.slice(0, 5));
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchResults, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Clear state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  // Actual sidebar portal rendering
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[998]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 w-full max-w-sm h-full bg-white shadow-2xl z-[999] p-4 border-r border-gray-200"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Search</h2>
              <button onClick={onClose}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search for products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    onClose();
                  }
                }}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Search Results */}
            {loading ? (
              <div className="space-y-2">
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="border border-gray-100 rounded-md shadow max-h-60 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => {
                      navigate(`/product/${product.name}`, { state: { product } });
                      onClose();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    {product.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-2 border-t border-gray-100 text-purple-600 hover:bg-purple-50 font-medium"
                >
                  View All Results
                </button>
              </div>
            ) : (
              searchQuery.trim() && (
                <p className="text-gray-500 text-sm px-2 mt-2">No products found.</p>
              )
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SearchSidebar;
