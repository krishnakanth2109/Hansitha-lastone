import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShoppingBag, Plus, Minus, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const NewArrivalsPage = () => {
  const { products: allProducts, loading } = useProducts();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const HEADER_IMAGE = "https://i.pinimg.com/originals/9e/c5/cd/9ec5cdfe4d18f004394209d1fb0ddebb.jpg";

  const products = allProducts.filter((product: any) => product && product.newArrival === true);

  const handleQty = (e: React.MouseEvent, productId: string, delta: number, maxStock: number) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(currentQty + delta, maxStock));
      return { ...prev, [productId]: newQty };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#D03D56]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      
      {/* 1. HERO HEADER */}
      <div className="relative h-[200px] md:h-[350px] w-full flex items-center justify-center overflow-hidden mt-0">
        
        {/* ✅ BACK BUTTON (Mobile Only) */}
        <button 
          onClick={() => navigate(-1)} 
          className="md:hidden absolute top-4 left-4 z-50 p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-all"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HEADER_IMAGE})` }}>
           <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        </div>
        <div className="container mx-auto text-center relative z-10 px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-3xl md:text-6xl font-serif font-bold text-white mb-1">Just Arrived ✨</h1>
            <p className="text-[10px] md:text-sm text-gray-200 uppercase tracking-[0.2em] font-light">The New Arrival Collection</p>
          </motion.div>
        </div>
      </div>

      <main className="flex-grow container mx-auto max-w-[1400px] px-3 sm:px-4 py-8 pb-24 lg:pb-12">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight uppercase border-l-4 pl-3" style={{ borderColor: "#9B59B6" }}>
            New Arrivals
          </h2>
        </div>

        {/* 2. PRODUCT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6">
          <AnimatePresence>
            {products.length === 0 ? (
               <div className="col-span-full py-20 text-center text-gray-400">No new arrivals found.</div>
            ) : (
              products.map((product) => {
                if (!product) return null;
                const isOutOfStock = product.stock <= 0;
                const qty = quantities[product._id] || 1;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={product._id}
                    className="bg-white group flex flex-col h-full border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
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

                      {/* NEW Badge */}
                      <div className="absolute top-2 left-2 bg-[#D03D56] text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 uppercase rounded shadow-md z-10">
                        NEW
                      </div>

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
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
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
                      <p className="font-bold text-sm sm:text-base mb-2" style={{ color: "#9B59B6" }}>
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
                            
                            // Reset local qty back to 1 after adding to cart
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
              })
            )}
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

export default NewArrivalsPage;