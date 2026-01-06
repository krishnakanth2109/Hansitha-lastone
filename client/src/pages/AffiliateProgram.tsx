// src/pages/AffiliateProgram.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// --- Import Shared Components ---
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import BottomNavBar from '../components/BottomNavBar';
import SearchSidebar from '../components/SearchSidebar';
import Sidebar from '../components/Sidebar';

// --- Import Scroll Lock Utility ---
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

const AffiliateProgram = () => {
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
              Join Our Affiliate Program
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Partner with Hansitha Creations and earn commissions by sharing our handcrafted sarees with your audience.
            </p>
          </header>

          {/* Why Partner With Us Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Why Partner With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generous Commissions</h3>
                <p className="text-gray-600">Earn a competitive commission on every sale you refer.</p>
              </div>
              <div className="bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Exclusive Products</h3>
                <p className="text-gray-600">Promote unique, high-quality handcrafted items your audience will love.</p>
              </div>
              <div className="bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Creative Assets</h3>
                <p className="text-gray-600">Get access to our library of beautiful banners and promotional materials.</p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mb-12 bg-white/80 p-8 rounded-xl shadow-lg backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">How It Works</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>1. Sign Up:</strong> Fill out our simple application form to join the program.</p>
              <p><strong>2. Share:</strong> Use your unique affiliate link to share our products on your blog, social media, or website.</p>
              <p><strong>3. Earn:</strong> Receive a commission for every purchase made through your link.</p>
            </div>
          </section>

          {/* Get Started Section */}
          <section className="text-center bg-white/80 p-8 rounded-xl shadow-lg backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-700 mb-6">
              Join a community that celebrates artistry and style. Click the button below to apply.
            </p>
            <Link to="/register" className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Apply Now
            </Link>
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

export default AffiliateProgram;