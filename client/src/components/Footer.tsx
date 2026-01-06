import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CurrencySelector } from "./CurrencySelector";
import {
  Facebook,
  Instagram,
  MessageCircleMore,
  Youtube,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://hansitha-web-storefront.onrender.com/api/newsletter",
        { email }
      );
      // The success message is now updated as per your request.
      toast.success("Thanks for messaging");
      setEmail("");
    } catch (err) {
      toast.error(
        (err as any).response?.data?.message || "Subscription failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <footer className="bg-gray-900 text-white pt-8 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-4">
              <img
                src="https://res.cloudinary.com/djyredhur/image/upload/v1751127717/logo_ktewtc.png"
                alt="Hansitha Creations Logo"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4 max-w-xs">
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
                href="https://wa.me/919908697335" // Example number, replace if needed
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-green-500 transition-all duration-300 transform hover:scale-110 hover:rotate-6"
              >
                <MessageCircleMore className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products Dropdown */}
          <div>
            <button
              onClick={() => toggleDropdown("products")}
              className="w-full flex items-center justify-between md:cursor-default font-semibold mb-4 md:mb-0"
            >
              Products
              <span className="md:hidden">
                {openDropdown === "products" ? <ChevronUp /> : <ChevronDown />}
              </span>
            </button>
            <ul
              className={`space-y-2 text-gray-400 transition-all duration-300 ${
                openDropdown === "products" ? "block" : "hidden"
              } md:block`}
            >
              {[
                "Cotton",
                "Silk",
                "Crape",
                "Kota",
                "Georgette",
                "Tusser",
                "Handlooms",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to={`/fabrics/${item.toLowerCase()}`}
                    className="hover:text-pink-400 transition-colors capitalize"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Company Dropdown */}
          <div>
            <button
              onClick={() => toggleDropdown("company")}
              className="w-full flex items-center justify-between md:cursor-default font-semibold mb-4 md:mb-0"
            >
              Our Company
              <span className="md:hidden">
                {openDropdown === "company" ? <ChevronUp /> : <ChevronDown />}
              </span>
            </button>
            <ul
              className={`space-y-2 text-gray-400 transition-all duration-300 ${
                openDropdown === "company" ? "block" : "hidden"
              } md:block`}
            >
              {[
                "About Us",
                "Careers",
                "Press",
                "Blog",
                "Affiliate Program",
                "Partnership",
              ].map((item) => {
                  let link;
                  if (item === "About Us") {
                    link = <Link to="/about" className="hover:text-pink-400 transition-colors">{item}</Link>;
                  } else if (item === "Blog") {
                    link = <Link to="/blog" className="hover:text-pink-400 transition-colors">{item}</Link>;
                  } else if (item === "Press") {
                    link = <Link to="/press" className="hover:text-pink-400 transition-colors">{item}</Link>;
                  } else if (item === "Affiliate Program") {
                    link = <Link to="/affiliate-program" className="hover:text-pink-400 transition-colors">{item}</Link>;
                  } else if (item === "Partnership") {
                    link = <Link to="/partnership" className="hover:text-pink-400 transition-colors">{item}</Link>;
                  } else {
                    link = <a href="#" className="hover:text-pink-400 transition-colors">{item}</a>;
                  }
                  return <li key={item}>{link}</li>;
              })}
            </ul>
          </div>

          {/* Newsletter Dropdown */}
          <div>
            <button
              onClick={() => toggleDropdown("newsletter")}
              className="w-full flex items-center justify-between md:cursor-default font-semibold mb-4 md:mb-0"
            >
              Subscribe to Newsletter
              <span className="md:hidden">
                {openDropdown === "newsletter" ? (
                  <ChevronUp />
                ) : (
                  <ChevronDown />
                )}
              </span>
            </button>

            <div
              className={`${
                openDropdown === "newsletter" ? "block" : "hidden"
              } md:block`}
            >
              <p className="text-gray-400 mb-4">
                Get the latest updates on new products and upcoming sales
              </p>
              <div className="flex">
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
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  aria-label="Email address"
                />

                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className={`px-4 py-2 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-r-lg transition-colors hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed`}
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
              {message && (
                <p className="text-sm mt-2 text-pink-400">{message}</p>
              )}
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mt-6 items-center">
                <h5 className="font-semibold mb-2">Select Your Currency</h5>
                <CurrencySelector />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t border-gray-800 pt-8 md:pb-0 flex flex-col md:flex-row justify-between items-center"
          style={{
            paddingBottom: "var(--bottom-nav-height, 5rem)",
          }}
        >
          <p className="text-gray-400 text-sm">
            © 2025 Hansitha Creations. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy-policy"
              className="text-gray-400 hover:text-pink-400 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <a
              href="#"
              className="text-gray-400 hover:text-pink-400 text-sm transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-pink-400 text-sm transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};