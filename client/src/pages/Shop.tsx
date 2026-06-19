import React, { useContext, useEffect, useState } from "react";
import { ProductContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  X, Heart, Filter, ShoppingBag, Plus, Minus,
  Search, User, Home, ChevronDown
} from "lucide-react";
import clsx from "clsx";
import { useCurrency } from "@/context/CurrencyContext";
import { Footer } from "../components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { toastWithVoice } from "@/utils/toast";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { PriceDisplay } from "../components/PriceDisplay";
import axios from "axios";

interface CategoryData {
  _id: string;
  name: string;
}

const Shop: React.FC = () => {
  const { products, loading: productsLoading } = useContext(ProductContext);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [showFilterMobile, setShowFilterMobile] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showFilterMobile ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showFilterMobile]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories`);
        setCategories(res.data);
      } catch (err) { console.error(err); }
    };
    fetchCategories();
  }, [API_URL]);

  const handlePriceInput = (value: string, setter: (val: number | "") => void) => {
    if (value === "") { setter(""); return; }
    const num = Number(value);
    if (num >= 0) setter(num);
  };

  const filtered = products
    .filter((product) => {
      const categoryMatch = selectedCategory
        ? product.category.toLowerCase() === selectedCategory.toLowerCase()
        : true;
      const actualMin = minPrice === "" ? 0 : minPrice;
      const actualMax = maxPrice === "" ? Infinity : maxPrice;
      return categoryMatch && product.price >= actualMin && product.price <= actualMax;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return a.price - b.price;
      if (sortOrder === "desc") return b.price - a.price;
      return 0;
    });

  const handleQty = (e: React.MouseEvent, id: string, delta: number, stock: number) => {
    e.stopPropagation();
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min((prev[id] || 1) + delta, stock))
    }));
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      {isMobile && (
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="font-extrabold text-gray-900 text-base uppercase tracking-tight">Filters</h3>
          <button onClick={() => setShowFilterMobile(false)} className="p-2 bg-gray-100 rounded-md">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      {/* Category Section */}
      <div>
        <h3 className="font-bold text-gray-900 text-base mb-4 tracking-tight">Category</h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio" name="cat"
              checked={selectedCategory === null}
              onChange={() => setSelectedCategory(null)}
              className="w-4 h-4 text-blue-600 focus:ring-0 border-gray-300"
            />
            <span className={clsx("text-sm transition-all", selectedCategory === null ? "text-blue-600 font-bold" : "text-gray-600")}>
              All Collections
            </span>
          </label>
          {categories.map(cat => (
            <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio" name="cat"
                checked={selectedCategory === cat.name}
                onChange={() => {
                  setSelectedCategory(cat.name);
                  if (isMobile) setShowFilterMobile(false);
                }}
                className="w-4 h-4 text-blue-600 focus:ring-0 border-gray-300"
              />
              <span className={clsx("text-sm transition-all", selectedCategory === cat.name ? "text-blue-600 font-bold" : "text-gray-600 group-hover:text-gray-900")}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div>
        <h3 className="font-bold text-gray-900 text-base mb-4 tracking-tight">Price Range</h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-bold">₹</span>
            <input
              type="number" placeholder="0" value={minPrice}
              onChange={e => handlePriceInput(e.target.value, setMinPrice)}
              className="w-full border border-gray-200 py-2.5 pl-7 pr-3 text-sm rounded-md font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none text-gray-700"
              min="0"
            />
          </div>
          <span className="text-gray-500 text-sm font-bold">to</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-bold">₹</span>
            <input
              type="number" placeholder="10000" value={maxPrice}
              onChange={e => handlePriceInput(e.target.value, setMaxPrice)}
              className="w-full border border-gray-200 py-2.5 pl-7 pr-3 text-sm rounded-md font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none text-gray-700"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Sort By Section */}
      <div>
        <h3 className="font-bold text-gray-900 text-base mb-4 tracking-tight">Sort By</h3>
        <div className="space-y-2.5">
          {[
            { label: "Default", value: "" },
            { label: "Price: Low to High", value: "asc" },
            { label: "Price: High to Low", value: "desc" },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio" name="sort"
                checked={sortOrder === option.value}
                onChange={() => setSortOrder(option.value as any)}
                className="w-4 h-4 text-blue-600 focus:ring-0 border-gray-300"
              />
              <span className={clsx("text-sm transition-all", sortOrder === option.value ? "text-blue-600 font-bold" : "text-gray-600 group-hover:text-gray-900")}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F2F2F4" }}>
      <AnimatePresence>
        {showFilterMobile && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[9998]"
              onClick={() => setShowFilterMobile(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-[310px] bg-white shadow-2xl z-[9999] overflow-y-auto p-6"
            >
              <FilterPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow container mx-auto px-4 py-8 pb-32 lg:pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {selectedCategory || "Shop Collection"}
          </h2>
          <button
            onClick={() => setShowFilterMobile(true)}
            className="flex items-center gap-2 bg-gray-50 text-gray-900 font-bold px-5 py-2.5 rounded-md border border-gray-200 hover:bg-gray-100 transition-all active:scale-95 text-xs tracking-widest"
          >
            <Filter size={16} /> FILTERS
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          <aside className="hidden lg:block sticky top-28 h-fit bg-white border border-gray-100 p-6 rounded-lg shadow-sm">
            <FilterPanel />
          </aside>

          <section>
            {filtered.length === 0 ? (
              <div className="bg-gray-50 py-20 text-center rounded-lg border-2 border-dashed border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800">No matching products</h3>
                <button
                  onClick={() => { setSelectedCategory(null); setMinPrice(""); setMaxPrice(""); setSortOrder(""); }}
                  className="mt-6 px-8 py-2.5 text-white font-bold rounded-md text-xs tracking-widest"
                  style={{ background: "linear-gradient(to right, #5B6CF9, #9B59B6, #E91E8C)" }}
                >
                  CLEAR FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {filtered.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const qty = quantities[product._id] || 1;
                  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={product._id}
                      className="bg-white group flex flex-col h-full rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                    >
                      {/* Image */}
                      <div
                        className="relative w-full aspect-[3/4] overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/product/${encodeURIComponent(product.name)}`, { state: { product } })}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className={clsx(
                            "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
                            isOutOfStock && "grayscale opacity-50"
                          )}
                        />

                        {/* Discount Badge */}
                        {hasDiscount && !isOutOfStock && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-sm tracking-wide z-10">
                            {product.discountPercentage
                              ? `${product.discountPercentage}% OFF`
                              : `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`
                            }
                          </div>
                        )}

                        {/* Wishlist */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!user) { toastWithVoice.error("Log in to save items"); return; }
                            toggleWishlist(product._id);
                          }}
                          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md z-10 hover:scale-110 transition-transform"
                        >
                          <Heart size={15} className={clsx(isInWishlist(product._id) ? "text-red-500 fill-red-500" : "text-gray-400")} />
                        </button>

                        {/* Sold Out */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                            <span className="bg-black text-white px-3 py-1.5 text-[10px] font-black tracking-widest rounded-full">SOLD OUT</span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-3 flex flex-col flex-grow">
                        <h3 className="text-gray-800 font-medium text-sm leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="mb-3">
                          <PriceDisplay
                            price={product.price}
                            originalPrice={product.originalPrice}
                            discountPercentage={product.discountPercentage}
                            size="md"
                          />
                        </div>

                        <div className="mt-auto space-y-2">
                          {/* Qty Stepper */}
                          {!isOutOfStock && (
                            <div className="flex items-center justify-between border border-gray-200 rounded-md">
                              <button
                                onClick={(e) => handleQty(e, product._id, -1, product.stock)}
                                className="w-10 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                              >
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <span className="font-bold text-gray-900 text-sm">{qty}</span>
                              <button
                                onClick={(e) => handleQty(e, product._id, 1, product.stock)}
                                className="w-10 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                              >
                                <Plus size={14} strokeWidth={3} />
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
                              toastWithVoice.success("Added to cart!");
                            }}
                            disabled={isOutOfStock}
                            className={clsx(
                              "w-full py-2.5 rounded-md flex items-center justify-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all active:scale-95",
                              isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-white shadow-sm"
                            )}
                            style={!isOutOfStock ? { background: "linear-gradient(to right, #5B6CF9, #9B59B6, #E91E8C)" } : {}}
                          >
                            <ShoppingBag size={13} />
                            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 flex justify-around items-center z-[110] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button onClick={() => navigate("/shop")} className="flex flex-col items-center gap-0.5 min-w-[60px]" style={{ color: "#9B59B6" }}>
          <Home size={22} />
          <span className="text-[10px] font-bold uppercase tracking-tight">Shop</span>
        </button>
        <button onClick={() => navigate("/wishlist")} className="flex flex-col items-center gap-0.5 min-w-[60px] text-gray-400 hover:text-gray-600 transition-colors">
          <Heart size={22} />
          <span className="text-[10px] font-medium uppercase tracking-tight">Wishlist</span>
        </button>
        <button onClick={() => navigate("/search")} className="flex flex-col items-center gap-0.5 min-w-[60px] text-gray-400 hover:text-gray-600 transition-colors">
          <Search size={22} />
          <span className="text-[10px] font-medium uppercase tracking-tight">Search</span>
        </button>
        <button onClick={() => navigate("/account")} className="flex flex-col items-center gap-0.5 min-w-[60px] text-gray-400 hover:text-gray-600 transition-colors">
          <User size={22} />
          <span className="text-[10px] font-medium uppercase tracking-tight">Account</span>
        </button>
      </nav>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default Shop;