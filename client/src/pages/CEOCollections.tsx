import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, Crown, ShoppingBag, Plus, Minus, ArrowLeft } from 'lucide-react'; 
import { useCart } from '../context/CartContext'; 
import { useWishlist } from '../context/WishlistContext'; 
import { useCurrency } from '../context/CurrencyContext'; 
import { useProducts, Product } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const CEOCollectionsPage = () => {
  const { products: allProducts, loading } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Local state for handling quantities of each product
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const HEADER_IMAGE = "https://www.chhunchi.com/cdn/shop/files/chhunhi_header_banner_2.jpg?v=1734283833&width=1920";

  // --- ✅ FILTER LOGIC: Check the ceoCollection boolean flag instead of the category name ---
  const products = allProducts.filter((p: any) => p.ceoCollection === true);

  // Quantity Handler
  const handleQty = (e: React.MouseEvent, id: string, delta: number, stock: number) => {
    e.stopPropagation();
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min((prev[id] || 1) + delta, stock))
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#D03D56]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-serif" style={{ backgroundColor: "#ffffff" }}>
      {/* --- HERO HEADER --- */}
      <div className="relative h-[40vh] md:h-[550px] w-full flex items-center justify-center overflow-hidden">
        
        {/* ✅ BACK BUTTON (Mobile Only) */}
        <button 
          onClick={() => navigate(-1)} 
          className="md:hidden absolute top-4 left-4 z-50 p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-all"
        >
          <ArrowLeft size={24} />
        </button>

        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HEADER_IMAGE})` }}
        >
           <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10 px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex justify-center mb-4 md:mb-6">
              <span className="bg-[#D03D56] text-white px-3 py-1 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center gap-2 shadow-2xl border border-white/20">
                <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" /> Signature Series
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-3 md:mb-6 leading-tight">
              CEO Collections
            </h1>
            <p className="text-sm md:text-xl text-gray-200 max-w-3xl mx-auto italic font-light px-2">
              "Masterpieces of heritage handpicked by our founder."
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- PRODUCT GRID SECTION --- */}
      {/* ✅ Removed the bg-[#C0A9E1] color from this section */}
      <div className="py-8 md:py-12 px-3 sm:px-4 min-h-screen">
        <div className="container mx-auto max-w-7xl">
          
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl font-medium">No items found in CEO Collections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6">
              <AnimatePresence>
                {products.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const qty = quantities[product._id] || 1;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={product._id}
                      className="bg-white group flex flex-col h-full border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 font-sans"
                    >
                      {/* Responsive Image Wrapper */}
                      <div
                        className="relative w-full overflow-hidden cursor-pointer"
                        style={{ paddingBottom: "133.33%" }}
                        onClick={() => navigate(`/product/${encodeURIComponent(product.name)}`, { state: { product } })}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className={clsx(
                            "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
                            isOutOfStock && "grayscale opacity-50"
                          )}
                        />

                        {/* Wishlist button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product._id);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors z-10"
                        >
                          <Heart
                            size={15}
                            className={clsx(isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400")}
                          />
                        </button>

                        {/* Out of Stock Overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <span className="bg-white text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="p-2 sm:p-3 flex flex-col flex-grow">
                        <h3 className="text-gray-800 font-medium text-xs sm:text-sm leading-snug mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-900 font-bold text-sm sm:text-base mb-2">
                          {formatPrice(product.price)}
                        </p>

                        <div className="mt-auto space-y-1.5 sm:space-y-2">
                          {/* Qty selector */}
                          {!isOutOfStock && (
                            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md overflow-hidden">
                              <button
                                onClick={(e) => handleQty(e, product._id, -1, product.stock)}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors"
                              >
                                <Minus size={15} strokeWidth={2.5} />
                              </button>
                              <span className="font-bold text-gray-900 text-xs sm:text-sm">{qty}</span>
                              <button
                                onClick={(e) => handleQty(e, product._id, 1, product.stock)}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors"
                              >
                                <Plus size={15} strokeWidth={2.5} />
                              </button>
                            </div>
                          )}

                          {/* Add to Cart */}
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
                              
                              // Optional: Reset local qty back to 1 after adding to cart
                              setQuantities(prev => ({ ...prev, [product._id]: 1 }));
                            }}
                            disabled={isOutOfStock}
                            className={clsx(
                              "w-full flex items-center justify-center gap-1 transition-all active:scale-95 rounded-md uppercase tracking-widest font-bold",
                              "py-2 sm:py-2.5 text-[9px] sm:text-[11px] md:text-xs",
                              isOutOfStock
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "text-white shadow-sm"
                            )}
                            style={!isOutOfStock ? { background: "linear-gradient(to right, #5B6CF9, #9B59B6, #E91E8C)" } : {}}
                          >
                            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CEOCollectionsPage;