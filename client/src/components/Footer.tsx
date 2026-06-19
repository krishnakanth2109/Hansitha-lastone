import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CurrencySelector } from "./CurrencySelector";
import {
  Facebook,
  Instagram,
  Youtube,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// Define the Category interface
interface Category {
  _id: string;
  name: string;
}

// Custom accurate WhatsApp Icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor" 
    viewBox="0 0 16 16" 
    className={className}
  >
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
  </svg>
);

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State for fetched categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch Categories from the backend
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

  const handleSubscribe = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://hansitha-web-storefront.onrender.com";
      await axios.post(`${apiUrl}/api/subscribers`, { email });
      
      toast.success("Successfully Subscribed to the newsletter!");
      setEmail("");
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to subscribe. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <footer className="bg-gray-900 text-white pt-8 pb-24 md:pb-6 font-sans">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8">
          
          {/* Company Info */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left mb-6 md:mb-0">
            <div className="mb-4">
              <img
                src="https://image2url.com/r2/default/images/1772210611595-7ee84200-e993-4ac9-adc4-f0e1096cb426.png"
                alt="Hansitha Creations Logo"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4 max-w-xs text-sm md:text-base">
              Your premier destination for women's fashion. Discover the latest
              trends in dresses, sarees, and accessories.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.facebook.com/kiranmai.sarees"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-all duration-300 transform hover:scale-110 hover:rotate-6"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/hansitha_creations_9/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 hover:rotate-6 bg-gray-800 hover:bg-[radial-gradient(circle_at_30%_107%,_#fdf497_0%,_#fd5949_45%,_#d6249f_60%,_#285AEB_90%)]"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@kiranmaisarees3089"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all duration-300 transform hover:scale-110 hover:rotate-6"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919908697335" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-green-500 transition-all duration-300 transform hover:scale-110 hover:rotate-6"
              >
                {/* Custom WhatsApp Icon inserted here */}
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products Dropdown */}
          <div className="border-b border-gray-800 md:border-none">
            <button
              onClick={() => toggleDropdown("products")}
              className="w-full flex items-center justify-between md:cursor-default font-semibold py-3 md:py-0 mb-0 md:mb-4 outline-none"
            >
              <span>Products</span>
              <span className="md:hidden text-gray-400">
                {openDropdown === "products" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </span>
            </button>
            <ul
              className={`space-y-2 text-gray-400 transition-all duration-300 pb-3 md:pb-0 ${
                openDropdown === "products" ? "block" : "hidden"
              } md:block`}
            >
              {categories.length === 0 ? (
                <li className="text-gray-500 text-sm">Loading...</li>
              ) : (
                categories.map((item) => (
                  <li key={item._id}>
                    <Link
                      to={`/fabrics/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="hover:text-pink-400 transition-colors capitalize text-sm md:text-base"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Our Company Dropdown */}
          <div className="border-b border-gray-800 md:border-none">
            <button
              onClick={() => toggleDropdown("company")}
              className="w-full flex items-center justify-between md:cursor-default font-semibold py-3 md:py-0 mb-0 md:mb-4 outline-none"
            >
              <span>Our Company</span>
              <span className="md:hidden text-gray-400">
                {openDropdown === "company" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </span>
            </button>
            <ul
              className={`space-y-2 text-gray-400 transition-all duration-300 pb-3 md:pb-0 ${
                openDropdown === "company" ? "block" : "hidden"
              } md:block`}
            >
              {[
                "About Us",
                "Press",
                "Blog",
                "Affiliate Program",
                "Partnership",
              ].map((item) => {
                  let link;
                  if (item === "About Us") {
                    link = <Link to="/about" className="hover:text-pink-400 transition-colors text-sm md:text-base">{item}</Link>;
                  } else if (item === "Blog") {
                    link = <Link to="/blog" className="hover:text-pink-400 transition-colors text-sm md:text-base">{item}</Link>;
                  } else if (item === "Press") {
                    link = <Link to="/press" className="hover:text-pink-400 transition-colors text-sm md:text-base">{item}</Link>;
                  } else if (item === "Affiliate Program") {
                    link = <Link to="/affiliate-program" className="hover:text-pink-400 transition-colors text-sm md:text-base">{item}</Link>;
                  } else if (item === "Partnership") {
                    link = <Link to="/partnership" className="hover:text-pink-400 transition-colors text-sm md:text-base">{item}</Link>;
                  } else {
                    link = <a href="#" className="hover:text-pink-400 transition-colors text-sm md:text-base">{item}</a>;
                  }
                  return <li key={item}>{link}</li>;
              })}
            </ul>
          </div>

          {/* Newsletter Dropdown */}
          <div className="pt-2 md:pt-0">
            <button
              onClick={() => toggleDropdown("newsletter")}
              className="w-full flex items-center justify-between md:cursor-default font-semibold py-3 md:py-0 mb-0 md:mb-4 outline-none"
            >
              <span>Subscribe to Newsletter</span>
              <span className="md:hidden text-gray-400">
                {openDropdown === "newsletter" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </span>
            </button>

            <div
              className={`pb-4 md:pb-0 ${
                openDropdown === "newsletter" ? "block" : "hidden"
              } md:block`}
            >
              <p className="text-gray-400 mb-4 text-sm md:text-base">
                Get the latest updates on new products and upcoming sales
              </p>
              <div className="flex w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubscribe();
                    }
                  }}
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 px-4 py-2.5 bg-gray-800 text-white text-sm border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500"
                  aria-label="Email address"
                />

                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className={`px-4 py-2.5 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-r-lg transition-colors hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm whitespace-nowrap`}
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>
            </div>
            
            {/* Currency Selector */}
            <div className="flex flex-col md:items-start text-left mt-6 hidden md:block">
              <h5 className="font-semibold mb-2">Select Your Currency</h5>
              <CurrencySelector />
            </div>
            
            {/* Show Currency Selector centered on Mobile inside the dropdown if open, or below if needed. For best UX, showing it at bottom for mobile. */}
            <div className="flex flex-col items-center mt-6 md:hidden w-full">
               <h5 className="font-semibold mb-2">Select Your Currency</h5>
               <CurrencySelector />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-center">
          <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-0">
            © 2025 Hansitha Creations. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              to="/privacy-policy"
              className="text-gray-400 hover:text-pink-400 text-xs md:text-sm transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};