import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingBag, Heart, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import clsx from "clsx";

// Category Interface
interface Category {
  _id: string;
  name: string;
}

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFabricsOpen, setIsFabricsOpen] = useState(false); // For mobile dropdown
  
  const location = useLocation();
  const navigate = useNavigate();

  // Assuming these contexts return arrays of items. Adjust if your context structure is different.
  const { cart } = useCart() as any; 
  const { wishlistItems } = useWishlist() as any;

  // Fetch Categories for the "Fabrics" dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://hansitha-web-storefront.onrender.com";
        const res = await axios.get(`${apiUrl}/api/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  // Main Navigation Links array
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "New Arrivals", path: "/new-arrivals" },
    { name: "CEO Collections", path: "/ceo-collections" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <>
      {/* --- TOP PROMO BAR (Optional) --- */}
      <div className="bg-gray-900 text-white text-[10px] md:text-xs text-center py-2 font-medium tracking-widest uppercase">
        Free Shipping on all orders over ₹5,000!
      </div>

      {/* --- MAIN HEADER --- */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          {/* 1. Mobile Menu Button (Left on Mobile) */}
          <button
            className="lg:hidden p-2 -ml-2 text-gray-800"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} strokeWidth={2} />
          </button>

          {/* 2. Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center justify-center">
            {/* Replace with your actual Logo Image if preferred */}
            <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900 tracking-tight">
              HANSITHA<span className="text-[#D03D56]">.</span>
            </h1>
          </Link>

          {/* 3. Desktop Navigation (Center) */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className={clsx("text-sm font-semibold uppercase tracking-wider transition-colors hover:text-[#D03D56]", location.pathname === "/" ? "text-[#D03D56]" : "text-gray-800")}>
              Home
            </Link>
            <Link to="/shop" className={clsx("text-sm font-semibold uppercase tracking-wider transition-colors hover:text-[#D03D56]", location.pathname === "/shop" ? "text-[#D03D56]" : "text-gray-800")}>
              Shop
            </Link>

            {/* Fabrics Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-gray-800 hover:text-[#D03D56] py-6">
                Fabrics <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 rounded-b-lg">
                {categories.length === 0 ? (
                  <span className="px-4 py-2 text-sm text-gray-400">Loading...</span>
                ) : (
                  categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/fabrics/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="px-4 py-2 text-sm text-gray-700 hover:text-[#D03D56] hover:bg-gray-50 capitalize transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))
                )}
              </div>
            </div>

            <Link to="/new-arrivals" className={clsx("text-sm font-semibold uppercase tracking-wider transition-colors hover:text-[#D03D56]", location.pathname === "/new-arrivals" ? "text-[#D03D56]" : "text-gray-800")}>
              New Arrivals
            </Link>
            <Link to="/ceo-collections" className={clsx("text-sm font-semibold uppercase tracking-wider transition-colors hover:text-[#D03D56]", location.pathname === "/ceo-collections" ? "text-[#D03D56]" : "text-gray-800")}>
              CEO Collections
            </Link>
            <Link to="/about" className={clsx("text-sm font-semibold uppercase tracking-wider transition-colors hover:text-[#D03D56]", location.pathname === "/about" ? "text-[#D03D56]" : "text-gray-800")}>
              About Us
            </Link>
            <Link to="/contact" className={clsx("text-sm font-semibold uppercase tracking-wider transition-colors hover:text-[#D03D56]", location.pathname === "/contact" ? "text-[#D03D56]" : "text-gray-800")}>
              Contact Us
            </Link>
          </nav>

          {/* 4. Icons (Right) */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <button onClick={() => navigate('/search')} className="text-gray-800 hover:text-[#D03D56] transition-colors">
              <Search size={20} strokeWidth={2} />
            </button>
            
            <button onClick={() => navigate('/account')} className="hidden md:block text-gray-800 hover:text-[#D03D56] transition-colors">
              <User size={20} strokeWidth={2} />
            </button>

            <button onClick={() => navigate('/wishlist')} className="relative hidden md:block text-gray-800 hover:text-[#D03D56] transition-colors">
              <Heart size={20} strokeWidth={2} />
              {/* Optional: Add Wishlist Badge here if you have context logic */}
              {/* <span className="absolute -top-1.5 -right-2 bg-[#D03D56] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">3</span> */}
            </button>

            <button onClick={() => navigate('/cart')} className="relative text-gray-800 hover:text-[#D03D56] transition-colors">
              <ShoppingBag size={20} strokeWidth={2} />
              {/* Optional: Add Cart Badge here if you have context logic */}
              {/* <span className="absolute -top-1.5 -right-2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">2</span> */}
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE SIDEBAR MENU --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[9998] lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[9999] shadow-2xl flex flex-col lg:hidden overflow-y-auto"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-xl font-serif font-bold tracking-tight">HANSITHA.</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-red-500">
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Links */}
              <nav className="flex flex-col py-4 px-5 space-y-5 flex-grow">
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="text-base font-semibold uppercase tracking-wider text-gray-900 hover:text-[#D03D56]">
                  Home
                </Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop" className="text-base font-semibold uppercase tracking-wider text-gray-900 hover:text-[#D03D56]">
                  Shop
                </Link>

                {/* Mobile Fabrics Accordion */}
                <div className="flex flex-col">
                  <button 
                    onClick={() => setIsFabricsOpen(!isFabricsOpen)} 
                    className="flex items-center justify-between text-base font-semibold uppercase tracking-wider text-gray-900 hover:text-[#D03D56]"
                  >
                    Fabrics
                    <ChevronDown size={16} className={clsx("transition-transform duration-300", isFabricsOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {isFabricsOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="flex flex-col pl-4 mt-3 space-y-3 overflow-hidden border-l-2 border-gray-100"
                      >
                        {categories.length === 0 ? (
                          <span className="text-sm text-gray-400">Loading...</span>
                        ) : (
                          categories.map((cat) => (
                            <Link
                              key={cat._id}
                              onClick={() => setIsMobileMenuOpen(false)}
                              to={`/fabrics/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                              className="text-sm text-gray-600 hover:text-[#D03D56] capitalize"
                            >
                              {cat.name}
                            </Link>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link onClick={() => setIsMobileMenuOpen(false)} to="/new-arrivals" className="text-base font-semibold uppercase tracking-wider text-gray-900 hover:text-[#D03D56]">
                  New Arrivals
                </Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/ceo-collections" className="text-base font-semibold uppercase tracking-wider text-gray-900 hover:text-[#D03D56]">
                  CEO Collections
                </Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/about" className="text-base font-semibold uppercase tracking-wider text-gray-900 hover:text-[#D03D56]">
                  About Us
                </Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/contact" className="text-base font-semibold uppercase tracking-wider text-gray-900 hover:text-[#D03D56]">
                  Contact Us
                </Link>
              </nav>

              {/* Mobile Footer Area (Account & Login) */}
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col gap-4">
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/account" className="flex items-center gap-3 text-sm font-bold text-gray-800 uppercase tracking-widest">
                  <User size={18} /> My Account
                </Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/wishlist" className="flex items-center gap-3 text-sm font-bold text-gray-800 uppercase tracking-widest">
                  <Heart size={18} /> Wishlist
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;