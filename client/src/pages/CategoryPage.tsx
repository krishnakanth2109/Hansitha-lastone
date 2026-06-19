import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Heart, X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { Footer } from "../components/Footer";
import clsx from "clsx";
import { toastWithVoice } from "@/utils/toast";
import { motion, AnimatePresence } from "framer-motion";

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  
  const { products, loading } = useProductContext();
  const { addToCart, cartItems } = useCart();
  const { formatPrice } = useCurrency();
  const { wishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high">("default");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 1024);
  const [showFilterMobile, setShowFilterMobile] = useState(false);

  // Local state for handling quantities of each product
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, minPrice, maxPrice, category]);

  // Quantity Handler
  const handleQty = (e: React.MouseEvent, id: string, delta: number, stock: number) => {
    e.stopPropagation();
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min((prev[id] || 1) + delta, stock))
    }));
  };

  // Filter products dynamically
  const totalFiltered = products.filter((p) => {
    const productCat = p.category?.toLowerCase().trim();
    const urlCat = category?.toLowerCase().trim();
    
    return (
      (urlCat === "all" || productCat === urlCat) && 
      p.price >= minPrice && 
      p.price <= maxPrice
    );
  });

  const sorted = [...totalFiltered].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PRODUCTS_PER_PAGE);
  const paginated = sorted.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleProductClick = (product: any) => {
    navigate(`/product/${encodeURIComponent(product.name)}`, { state: { product } });
  };

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: "#F2F2F4" }}>
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-grow">
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-2xl font-bold capitalize text-gray-900">
            {category} Collection
          </h2>
          <button
            onClick={() => setShowFilterMobile(true)}
            className="flex items-center gap-2 bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-lg shadow-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">☰</span> Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative">
          
          {/* Sidebar Filters */}
          <aside
            className={clsx(
              "bg-white w-full lg:w-64 flex-shrink-0 p-6 overflow-y-auto transition-transform duration-300 ease-in-out border border-gray-200 shadow-sm rounded-xl",
              {
                "fixed inset-y-0 left-0 z-50 transform translate-x-0 w-[80%] max-w-sm rounded-none rounded-r-xl shadow-2xl": showFilterMobile && isMobile,
                "fixed inset-y-0 left-0 z-50 transform -translate-x-full": !showFilterMobile && isMobile,
                "lg:sticky lg:top-[100px] lg:block lg:h-fit": true,
              }
            )}
            style={{ maxHeight: isMobile ? "100vh" : "calc(100vh - 140px)" }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 lg:hidden">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button 
                onClick={() => setShowFilterMobile(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Price Range Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="flex items-center gap-3">
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md pl-8 pr-2 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Min"
                    />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">to</span>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md pl-8 pr-2 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Sort By Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white cursor-pointer transition-all"
                >
                  <option value="default">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Mobile Overlay Background */}
          {isMobile && showFilterMobile && (
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
              onClick={() => setShowFilterMobile(false)}
            />
          )}

          {/* Product Grid Section */}
          <section className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 hidden lg:block capitalize">
              {category} Collection
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-32">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : paginated.length === 0 ? (
              <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-200">
                <p className="text-gray-500 text-lg mb-4">No products found in this category matching your filters.</p>
                <button 
                  onClick={() => { setMinPrice(0); setMaxPrice(10000); setSortBy("default"); }}
                  className="px-6 py-2 rounded-lg font-medium transition-colors text-white"
                  style={{ background: "linear-gradient(to right, #5B6CF9, #9B59B6, #E91E8C)" }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                  <AnimatePresence>
                    {paginated.map((product) => {
                      const isOutOfStock = product.stock <= 0;
                      const qty = quantities[product._id] || 1;
                      const isWishlisted = wishlist.includes(product._id);

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={product._id}
                          className="bg-white group flex flex-col h-full border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 font-sans"
                        >
                          {/* Responsive Image Wrapper (Matches CEOCollections) */}
                          <div
                            className="relative w-full overflow-hidden cursor-pointer"
                            style={{ paddingBottom: "133.33%" }}
                            onClick={() => handleProductClick(product)}
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
                              onClick={async (e) => {
                                e.stopPropagation();
                                await toggleWishlist(product._id);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors z-10"
                            >
                              <Heart
                                size={15}
                                className={clsx(isWishlisted ? "text-red-500 fill-red-500" : "text-gray-400")}
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
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (isOutOfStock) {
                                    toastWithVoice.error("Out of Stock!");
                                    return;
                                  }
                                  await addToCart({
                                    id: product._id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    quantity: qty,
                                  });
                                  toastWithVoice.success("Added to Cart!");
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all flex items-center justify-center ${
                          currentPage === pageNum
                            ? "text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                        style={currentPage === pageNum ? { background: "linear-gradient(to right, #5B6CF9, #9B59B6, #E91E8C)" } : {}}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;