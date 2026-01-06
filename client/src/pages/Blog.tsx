// src/pages/Blog.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- Import all necessary shared components ---
// Make sure these paths are correct for your project structure
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import BottomNavBar from '../components/BottomNavBar';
import SearchSidebar from '../components/SearchSidebar';
import Sidebar from '../components/Sidebar';

// --- Import the scroll lock utility ---
import {
  disableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock';

const Blog = () => {
  // --- State and Logic for Navigation Elements ---
  const [showSearch, setShowSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Effect to lock the body scroll when a modal/sidebar is open
  useEffect(() => {
    const target = isSidebarOpen ? sidebarRef.current : null;
    if (target) {
      disableBodyScroll(target);
    } else {
      clearAllBodyScrollLocks();
    }
    return () => clearAllBodyScrollLocks();
  }, [isSidebarOpen]);

  return (
    // The root container for the entire standalone page
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* --- RENDER THE HEADER --- */}
      <Header 
        onMenuClick={openSidebar} 
        onSearchClick={() => setShowSearch(true)} 
      />

      {/* --- MAIN CONTENT AREA --- */}
      <main 
        className="flex-grow" // It will fill the space between header and footer
        style={{ background: 'linear-gradient(to bottom right, #818cf8, #fca5a5)' }} // Red-Indigo Gradient
      >
        <div className="max-w-7xl mx-auto py-16 px-4 font-serif">
          
          {/* Page Header */}
          <header className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              From Our Loom
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Stories of craftsmanship, style guides, and a behind-the-scenes look at the world of Hansitha Creations.
            </p>
          </header>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Blog Post Card 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl">
              <img 
                src="https://i.pinimg.com/736x/5c/ca/eb/5ccaebf67ad16700a6028652856c5656.jpg" 
                alt="Saree Draping" 
                className="w-full h-64 object-cover"
              />
              <div className="p-7">
                <span className="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  Style Guides
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  5 Ways to Drape a Kota Saree for a Modern Look
                </h3>
                <p className="text-base text-gray-600 leading-relaxed mb-6">
                  Discover contemporary draping styles that add a fresh twist to the classic Kota saree...
                </p>
                <Link to="#" className="font-semibold text-purple-700 transition-colors duration-200 hover:text-pink-700 hover:underline">
                  Read More
                </Link>
              </div>
            </div>

            {/* Blog Post Card 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl">
              <img 
                src="https://i.pinimg.com/736x/74/6a/0a/746a0aa60449e1be7c8c0832a03eb303.jpg" 
                alt="Artisan Weaver" 
                className="w-full h-64 object-cover" 
              />
              <div className="p-7">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  Artisan Stories
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The Hands Behind the Art: Meet Our Master Weaver
                </h3>
                <p className="text-base text-gray-600 leading-relaxed mb-6">
                  A conversation with Ramesh, a third-generation weaver who brings our silk sarees to life...
                </p>
                <Link to="#" className="font-semibold text-purple-700 transition-colors duration-200 hover:text-pink-700 hover:underline">
                  Read More
                </Link>
              </div>
            </div>

            {/* Blog Post Card 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl">
              <img 
                src="https://i.pinimg.com/736x/0b/48/8c/0b488c025eaa0cac98c35198cc31e816.jpg" 
                alt="Folded Sarees" 
                className="w-full h-64 object-cover" 
              />
              <div className="p-7">
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  Saree Care
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How to Preserve Your Hand-Painted Sarees for Decades
                </h3>
                <p className="text-base text-gray-600 leading-relaxed mb-6">
                  Follow these essential tips to ensure your cherished hand-painted garments remain timeless...
                </p>
                <Link to="#" className="font-semibold text-purple-700 transition-colors duration-200 hover:text-pink-700 hover:underline">
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* --- FOOTER --- */}
      <Footer />

      {/* --- SIDEBARS AND MOBILE NAVIGATION --- */}
      {isSidebarOpen && (
        <>
          <Sidebar
            ref={sidebarRef}
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
        </>
      )}
      
      <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden">
        <BottomNavBar
          onMenuClick={openSidebar} 
          onSearchClick={() => setShowSearch(true)}
          onAccountClick={() => navigate('/account')}
        />
      </div>
      
      <SearchSidebar isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
};

export default Blog;