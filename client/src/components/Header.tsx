import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingCart, Heart, User, ChevronDown } from "lucide-react";
import axios from "axios";
import clsx from "clsx";

// Contexts
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

// Components
import SearchSidebar from "./SearchSidebar";

interface Category {
  _id: string;
  name: string;
}

interface HeaderProps {
  onMenuClick: () => void; // Opens mobile sidebar
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  // --- States ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // --- Hooks & Contexts ---
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const { user } = useAuth();

  // --- Calculations ---
  const cartCount = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.length || 0;

  // --- Fetch Categories for the "Fabrics" dropdown ---
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

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#fbfbfb] shadow-sm transition-all duration-300">
        
        {/* =========================================
            MOBILE & TABLET HEADER (Hidden on Desktop)
            ========================================= */}
        <div className="flex lg:hidden items-center justify-between h-16 px-4 border-b border-gray-200 relative">
          
          {/* Left: Hamburger & Search */}
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-800 hover:text-[#D03D56] transition-colors"
            >
              <Menu size={26} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-800 hover:text-[#D03D56] transition-colors"
            >
              <Search size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center h-full">
            <img
              src="https://image2url.com/r2/default/images/1772205361091-0b56eb8e-1794-4dd8-b8ab-bfdf9eadd29b.png"
              alt="Hansitha Logo"
              className="h-12 w-auto object-contain py-1"
            />
          </Link>

          {/* Right: Heart, Cart */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => navigate('/wishlist')} 
              className="relative w-10 h-10 flex items-center justify-center text-gray-800 hover:text-[#D03D56] transition-colors"
            >
              <Heart size={22} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-[16px] h-[16px] text-[9px] font-bold bg-[#D03D56] text-white rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => navigate('/cart')} 
              className="relative w-10 h-10 flex items-center justify-center text-gray-800 hover:text-[#D03D56] transition-colors"
            >
              <ShoppingCart size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-[16px] h-[16px] text-[9px] font-bold bg-[#D03D56] text-white rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* =========================================
            DESKTOP HEADER (Hidden on Mobile)
            ========================================= */}
        <div className="hidden lg:flex flex-col w-full">
          
          {/* --- TOP ROW: Logo & Icons --- */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between h-20 px-8 max-w-[1600px] mx-auto w-full">
              
              {/* Left Spacer (Keeps Logo exactly centered) */}
              <div className="flex-1"></div>

              {/* Center: Logo */}
              <Link to="/" className="flex-1 flex items-center justify-center">
                <img
                  src="https://image2url.com/r2/default/images/1772205361091-0b56eb8e-1794-4dd8-b8ab-bfdf9eadd29b.png"
                  alt="Hansitha Logo"
                  className="h-16 w-auto object-contain py-1"
                />
              </Link>

              {/* Right: Icons (Search, User, Heart, Cart) */}
              <div className="flex-1 flex items-center justify-end gap-5 text-gray-700">
                {/* <button 
                  onClick={() => setSearchOpen(true)} 
                  className="hover:text-[#D03D56] transition-colors"
                >
                  <Search size={22} strokeWidth={1.5} />
                </button>
                 */}
                <button 
                  onClick={() => navigate(user ? "/account" : "/login")} 
                  className="hover:text-[#D03D56] transition-colors"
                >
                  <User size={22} strokeWidth={1.5} />
                </button>

                <button 
                  onClick={() => navigate('/wishlist')} 
                  className="relative hover:text-[#D03D56] transition-colors"
                >
                  <Heart size={22} strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 text-[10px] font-bold bg-[#D03D56] text-white rounded-full flex items-center justify-center shadow-md">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => navigate('/cart')} 
                  className="relative hover:text-[#D03D56] transition-colors"
                >
                  <ShoppingCart size={22} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 text-[10px] font-bold bg-[#D03D56] text-white rounded-full flex items-center justify-center shadow-md">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* --- BOTTOM ROW: Navigation Links --- */}
          <div className="h-14 flex items-center justify-center max-w-[1600px] mx-auto w-full px-8">
            <nav className="flex items-center space-x-10">
              <Link to="/" className={clsx("text-[13px] font-bold uppercase tracking-widest transition-colors hover:text-[#D03D56]", location.pathname === "/" ? "text-[#D03D56]" : "text-gray-800")}>
                Home
              </Link>
              <Link to="/shop" className={clsx("text-[13px] font-bold uppercase tracking-widest transition-colors hover:text-[#D03D56]", location.pathname === "/shop" ? "text-[#D03D56]" : "text-gray-800")}>
                Shop
              </Link>

              {/* Fabrics Dropdown */}
              <div className="relative group h-full flex items-center">
                <button className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-widest text-gray-800 hover:text-[#D03D56] py-4">
                  Fabrics <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                </button>
                
                <div className="absolute top-[56px] left-1/2 transform -translate-x-1/2 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-3 rounded-b-lg z-50">
                  {categories.length === 0 ? (
                    <span className="px-5 py-2 text-sm text-gray-400 text-center">Loading...</span>
                  ) : (
                    categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/fabrics/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 text-center hover:text-[#D03D56] hover:bg-pink-50 capitalize transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <Link to="/new-arrivals" className={clsx("text-[13px] font-bold uppercase tracking-widest transition-colors hover:text-[#D03D56]", location.pathname === "/new-arrivals" ? "text-[#D03D56]" : "text-gray-800")}>
                New Arrivals
              </Link>
              <Link to="/ceo-collections" className={clsx("text-[13px] font-bold uppercase tracking-widest transition-colors hover:text-[#D03D56]", location.pathname === "/ceo-collections" ? "text-[#D03D56]" : "text-gray-800")}>
                CEO Collections
              </Link>
              <Link to="/about" className={clsx("text-[13px] font-bold uppercase tracking-widest transition-colors hover:text-[#D03D56]", location.pathname === "/about" ? "text-[#D03D56]" : "text-gray-800")}>
                About Us
              </Link>
              <Link to="/contact" className={clsx("text-[13px] font-bold uppercase tracking-widest transition-colors hover:text-[#D03D56]", location.pathname === "/contact" ? "text-[#D03D56]" : "text-gray-800")}>
                Contact Us
              </Link>
            </nav>
          </div>

        </div>
      </header>

      {/* --- SEARCH SIDEBAR COMPONENT --- */}
      <SearchSidebar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;