// src/components/SearchSidebar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// Grid Skeleton Loader
const SkeletonItem = () => (
  <div className="flex flex-col border border-gray-100 rounded-lg overflow-hidden shadow-sm animate-pulse">
    <div className="w-full aspect-[3/4] bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-300 rounded w-1/3 mt-2" />
      <div className="h-8 bg-gray-200 rounded w-full mt-3" />
      <div className="h-8 bg-gray-300 rounded w-full" />
    </div>
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
  
  // Contexts
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Auto-focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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
        // Show up to 6 results in the sidebar grid
        setSearchResults(data.slice(0, 6)); 
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchResults, 400); // Debounce
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Clear state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSearchQuery('');
        setSearchResults([]);
        setQuantities({});
      }, 300);
    }
  }, [isOpen]);

  // Handle Quantity Change
  const handleQty = (e: React.MouseEvent, id: string, delta: number, stock: number) => {
    e.stopPropagation();
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min((prev[id] || 1) + delta, stock))
    }));
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            // Wider sidebar (450px) on desktop to comfortably fit the 2-column grid
            className="fixed top-0 left-0 w-full sm:w-[450px] h-[100dvh] bg-white shadow-2xl z-[999] flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Search Products</h2>
              <button 
                onClick={onClose}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search Input Area */}
            <div className="p-4 sm:px-5 pt-4 pb-2 flex-shrink-0">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for sarees, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      onClose();
                    }
                  }}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Results Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-6 custom-scrollbar bg-gray-50/50">
              {loading ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                  <SkeletonItem />
                  <SkeletonItem />
                  <SkeletonItem />
                  <SkeletonItem />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                    Search Results
                  </p>
                  
                  {/* Grid Layout matching the requested UI */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {searchResults.map((product) => {
                      const isOutOfStock = product.stock <= 0;
                      const qty = quantities[product._id] || 1;
                      const wishlisted = isInWishlist(product._id);

                      return (
                        <div
                          key={product._id}
                          className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
                        >
                          {/* Image Section */}
                          <div 
                            className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-gray-100"
                            onClick={() => {
                              navigate(`/product/${encodeURIComponent(product.name)}`, { state: { product } });
                              onClose();
                            }}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className={clsx(
                                "w-full h-full object-cover transition-transform duration-700 hover:scale-105",
                                isOutOfStock && "grayscale opacity-70"
                              )}
                            />

                            {/* Wishlist Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(product._id);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10"
                            >
                              <Heart
                                size={14}
                                className={clsx(wishlisted ? "text-red-500 fill-red-500" : "text-gray-400")}
                              />
                            </button>

                            {/* Sold Out Overlay (Matches image) */}
                            {isOutOfStock && (
                              <div className="absolute bottom-2 left-0 right-0 flex justify-center z-10">
                                <span className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                  SOLD OUT
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="p-3 flex flex-col flex-grow">
                            <h3 
                              className="text-gray-800 font-medium text-[13px] leading-tight mb-1 line-clamp-2 cursor-pointer hover:text-blue-600"
                              onClick={() => {
                                navigate(`/product/${encodeURIComponent(product.name)}`, { state: { product } });
                                onClose();
                              }}
                            >
                              {product.name}
                            </h3>
                            
                            <p className="text-blue-600 font-bold text-sm mb-3">
                              {formatPrice(product.price)}
                            </p>

                            <div className="mt-auto space-y-2">
                              {/* Quantity Selector */}
                              {!isOutOfStock && (
                                <div className="flex items-center justify-between border border-gray-200 rounded-md overflow-hidden">
                                  <button
                                    onClick={(e) => handleQty(e, product._id, -1, product.stock)}
                                    className="w-8 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="font-bold text-gray-900 text-xs">{qty}</span>
                                  <button
                                    onClick={(e) => handleQty(e, product._id, 1, product.stock)}
                                    className="w-8 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              )}

                              {/* Add to Cart Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isOutOfStock) return;
                                  addToCart({
                                    id: product._id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    quantity: qty,
                                  });
                                  toast.success("Added to Cart!");
                                }}
                                disabled={isOutOfStock}
                                className={clsx(
                                  "w-full flex items-center justify-center gap-1.5 py-2 rounded-md uppercase tracking-wide font-bold text-[10px] transition-all active:scale-95",
                                  isOutOfStock
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-[#0f172a] text-white hover:bg-black shadow-sm"
                                )}
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* View All Button */}
                  <button
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      onClose();
                    }}
                    className="w-full mt-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    View All Results <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                searchQuery.trim() && !loading && (
                  <div className="text-center mt-16 px-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium text-lg">No results found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      We couldn't find any matches for "{searchQuery}".
                    </p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SearchSidebar;