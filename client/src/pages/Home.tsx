import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Sidebar from '../components/Sidebar';
import BottomNavBar from '../components/BottomNavBar';
import { Footer } from '@/components/Footer';
import { PromoSection } from '@/components/PromoSection';
import { HeroSection } from '@/components/HeroSection';
import FeaturedProducts from '@/pages/FeaturedProducts';
import CategoryCircle from '@/components/CategoryCircle';
import SearchSidebar from '@/components/SearchSidebar';
import AnnouncementBar from "@/components/AnnouncementBar";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Truck, 
  RefreshCcw, 
  Sparkles, 
  Heart,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock';

const API_URL = import.meta.env.VITE_API_URL;

// ==========================================
// 🎥 LOOPING YOUTUBE VIDEO COMPONENT
// ==========================================
const LoopingYouTubeVideo: React.FC = () => {
 const videoId = "GJGCZiKOJwc";
  const playerRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const createPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy?.();
        playerRef.current = null;
      }

      playerRef.current = new (window as any).YT.Player("yt-player", {
        videoId,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: videoId,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          mute: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            event.target.setPlaybackQuality("highres");
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              event.target.setPlaybackQuality("highres");
            }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      if (!document.getElementById("youtube-api")) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.id = "youtube-api";
        document.body.appendChild(tag);
      }

      const previousCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        createPlayer();
      };
    }

    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.playVideo(); 
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  return (
    <div className="relative flex justify-center items-center py-4 px-0 md:px-8 w-full">
      <div className="relative w-full max-w-[900px] aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div id="yt-player" className="absolute top-0 left-0 w-full h-full" />
        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 p-2 bg-black/60 text-white rounded-full z-10 hover:bg-black/80 transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
      <style>{`
        #yt-player { pointer-events: none; }
      `}</style>
    </div>
  );
};

// ==========================================
// 🏠 MAIN HOME COMPONENT
// ==========================================
const Home = () => {
  const [showSearch, setShowSearch] = useState(false);
  const { addToCart } = useCart();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const target = isSidebarOpen ? sidebarRef.current : isSignInOpen ? signInRef.current : null;
    if (target) {
      disableBodyScroll(target);
    } else {
      clearAllBodyScrollLocks();
    }
    return () => clearAllBodyScrollLocks();
  }, [isSidebarOpen, isSignInOpen]);

  return (
    <div 
      className="min-h-screen text-gray-900"
      style={{
        backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzHHl2qgAsswJB-E2MnNtBkXFUHQIAh8t_-g&s')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <AnnouncementBar />
      <HeroSection />

      {/* --- CATEGORIES SECTION --- */}
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/50">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center drop-shadow-sm uppercase tracking-wider">
            Shop By Categories
          </h2>
          <CategoryCircle />
        </div>
      </div>

      {/* --- VIDEO SPOTLIGHT SECTION --- */}
 <section className="relative py-16 overflow-hidden">

  {/* Background Glow */}
  <div className="absolute inset-0 bg-gradient-to-r from-pink-100 via-white to-purple-100 opacity-70"></div>

  {/* Decorative Blur Circles */}
  <div className="absolute top-10 left-10 w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-30"></div>
  <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-30"></div>

  <div className="relative max-w-6xl mx-auto px-4 text-center">

    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 uppercase tracking-widest">
      Featured Spotlight
    </h2>

    <div className="max-w-4xl mx-auto">
      <LoopingYouTubeVideo />
    </div>

  </div>

</section>

      <FeaturedProducts />
      <PromoSection />

      {/* --- EXCLUSIVE OFFERS --- */}
      <div className="px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-blue-500"></div>
          <div className="p-10 md:p-16 text-center">
            <span className="bg-pink-100 text-pink-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
              Limited Time Only
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Exclusive Offers
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Enjoy special discounts, seasonal sales, and exciting deals made just for you. 
              Fashion that fits your style and budget.
            </p>
            <Link to="/shop">
              <button className="bg-gradient-to-r from-blue-600 to-pink-600 text-white px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                View Offers
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* --- WHY SHOP WITH US --- */}
      <div className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 drop-shadow-sm mb-2">Why Shop With Us?</h2>
            <p className="text-gray-800 font-medium">We focus on quality, trust, and customer satisfaction.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: "Premium Quality", desc: "Handpicked fabrics & flawless stitching." },
              { icon: ShieldCheck, title: "Secure Payments", desc: "100% safe transactions & data privacy." },
              { icon: Truck, title: "Fast Delivery", desc: "Quick shipping across all locations." },
              { icon: RefreshCcw, title: "Easy Returns", desc: "Hassle-free exchange & return policy." },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl text-center shadow-lg hover:bg-white transition-colors group"
              >
                <div className="bg-blue-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- OUR PROMISE --- */}
      <div className="px-4 py-16">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-10 md:p-16">
              <div className="flex items-center gap-2 text-pink-600 font-bold mb-4">
                <Heart className="w-5 h-5 fill-current" />
                <span className="uppercase tracking-widest text-sm">Our Promise</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Confidence in Every Stitch
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We believe every woman deserves to feel confident and stylish. Our platform brings together comfort, fashion, and reliability.
              </p>
              <Link to="/about">
                <button className="border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-all">
                  Read Our Story
                </button>
              </Link>
            </div>
            <div className="h-full min-h-[300px]">
              <img 
                src="https://static.vecteezy.com/system/resources/thumbnails/036/065/738/small_2x/ai-generated-luxury-fabric-background-with-copy-space-photo.jpg" 
                alt="Our Promise" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- FINAL CTA --- */}
      <div className="py-20 text-center px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl font-serif font-bold text-gray-900 drop-shadow-sm mb-6"
        >
          Ready to Upgrade Your Wardrobe?
        </motion.h2>
        <Link to="/shop">
          <button className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 hover:bg-gray-50 transition-all border border-gray-200">
            Start Shopping
          </button>
        </Link>
      </div>

      <Footer />

      {isSidebarOpen && (
        <>
          <Sidebar ref={sidebarRef} isOpen={isSidebarOpen} onClose={closeSidebar} />
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
        </>
      )}
      <div className="fixed bottom-0 left-0 right-0 z-0 block lg:hidden">
        <BottomNavBar onAccountClick={() => { }} onSearchClick={() => setShowSearch(true)} />
      </div>
      <SearchSidebar isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
};

export default Home;