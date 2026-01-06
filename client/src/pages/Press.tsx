// src/pages/Press.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Import Shared Components ---
// Make sure these paths are correct for your project structure
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import BottomNavBar from '../components/BottomNavBar';
import SearchSidebar from '../components/SearchSidebar';
import Sidebar from '../components/Sidebar';

// --- Import Scroll Lock Utility ---
import {
  disableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock';

const Press = () => {
  // --- State and Logic for Navigation Elements ---
  const [showSearch, setShowSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Effect to lock body scroll when a sidebar is open
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
    // Root container for the entire page
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* --- RENDER THE HEADER --- */}
      <Header 
        onMenuClick={openSidebar} 
        onSearchClick={() => setShowSearch(true)} 
      />

      {/* --- MAIN CONTENT AREA --- */}
      <main 
        className="flex-grow" // The main content will grow to fill the space between header and footer
        style={{ background: 'linear-gradient(to bottom right, #818cf8, #fca5a5)' }} // Indigo-Red Gradient
      >
        <div className="max-w-4xl mx-auto py-16 px-4">
          
          {/* Page Header */}
          <header className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              Press & Media
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Welcome to the Hansitha Creations media hub. Here you'll find our latest press releases, brand assets, and features.
            </p>
          </header>

          {/* Featured In Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Featured In</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/70 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">VOGUE India</h3>
                <p className="text-gray-600 italic">"A modern take on traditional handlooms."</p>
              </div>
              <div className="bg-white/70 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Femina</h3>
                <p className="text-gray-600 italic">"The go-to brand for unique, handcrafted sarees."</p>
              </div>
              <div className="bg-white/70 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">The Hindu</h3>
                <p className="text-gray-600 italic">"Keeping the art of hand-painting alive."</p>
              </div>
            </div>
          </section>

          {/* Press Releases Section */}
          <section className="mb-12 bg-white/70 p-8 rounded-xl shadow-lg backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Press Releases</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>October 5, 2024:</strong> Hansitha Creations Launches New 'Festive Glow' Collection.</p>
              <p><strong>June 22, 2024:</strong> Founder Kiranmai Honored with 'Woman in Arts' Award.</p>
            </div>
          </section>

          {/* Media Inquiries Section */}
          <section className="text-center bg-white/70 p-8 rounded-xl shadow-lg backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Media Inquiries</h2>
            <p className="text-gray-700">
              For any media-related questions or to request our press kit, please contact us at <strong className="text-purple-700">press@hansithacreations.com</strong>.
            </p>
          </section>

        </div>
      </main>
      
      {/* --- FOOTER AND NAVIGATION SIDEBARS --- */}
      <Footer />

      {/* Sidebar with overlay and scroll lock */}
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
      
      {/* Mobile-only bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden">
        <BottomNavBar
          onMenuClick={openSidebar} 
          onSearchClick={() => setShowSearch(true)}
          onAccountClick={() => navigate('/account')}
        />
      </div>
      
      {/* Search sidebar that slides in */}
      <SearchSidebar isOpen={showSearch} onClose={() => setShowSearch(false)} />

    </div>
  );
};

export default Press;