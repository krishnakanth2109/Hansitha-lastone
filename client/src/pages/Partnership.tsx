// src/pages/Partnership.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Import Shared Components ---
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import BottomNavBar from '../components/BottomNavBar';
import SearchSidebar from '../components/SearchSidebar';
import Sidebar from '../components/Sidebar';

// --- Import Scroll Lock Utility ---
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

const Partnership = () => {
  // --- State and Logic for Navigation ---
  const [showSearch, setShowSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

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
    <div className="min-h-screen flex flex-col bg-white">
      <Header 
        onMenuClick={openSidebar} 
        onSearchClick={() => setShowSearch(true)} 
      />

      <main 
        className="flex-grow py-16 px-4"
        style={{ background: 'linear-gradient(to bottom right, #818cf8, #fca5a5)' }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <header className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              Collaborate With Us
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              We believe in the power of collaboration. Let's work together to create something beautiful.
            </p>
          </header>

          {/* B2B & Corporate Gifting Section */}
          <section className="mb-12 bg-white/80 p-8 rounded-xl shadow-lg backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">B2B & Corporate Gifting</h2>
            <p className="text-gray-700 leading-relaxed">
              Looking for unique, handcrafted gifts for your clients or employees? We offer special pricing for bulk orders and can create custom designs to match your brand's identity. Perfect for festivals, corporate events, and special occasions.
            </p>
          </section>

          {/* Designer & Brand Collaborations Section */}
          <section className="mb-12 bg-white/80 p-8 rounded-xl shadow-lg backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Designer & Brand Collaborations</h2>
            <p className="text-gray-700 leading-relaxed">
              Are you a designer, artist, or brand looking to co-create a collection? We are always open to exploring creative partnerships that merge our traditional craft with a new vision. Let's weave a new story together.
            </p>
          </section>

          {/* Get In Touch Section */}
          <section className="text-center bg-white/80 p-8 rounded-xl shadow-lg backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Get In Touch</h2>
            <p className="text-gray-700">
              To discuss a potential partnership, please reach out to our collaborations team at <strong className="text-purple-700">partners@hansithacreations.com</strong> with your proposal.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />

      {isSidebarOpen && (
        <>
          <Sidebar ref={sidebarRef} isOpen={isSidebarOpen} onClose={closeSidebar} />
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
        </>
      )}
      
      <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden">
        <BottomNavBar onMenuClick={openSidebar} onSearchClick={() => setShowSearch(true)} onAccountClick={() => navigate('/account')} />
      </div>
      
      <SearchSidebar isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
};

export default Partnership;