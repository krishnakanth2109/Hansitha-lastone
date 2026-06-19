import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Heart, 
  Award, 
  Users, 
  Sparkles, 
  Star, 
  Shield, 
  Globe, 
  Palette, 
  Target, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout'; 
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

const AboutPage = () => {
  // ✅ State for Founder Images
  const [founderImages, setFounderImages] = useState([
    "https://yt3.ggpht.com/LsoIf19PJEy5ORPtjUAJeIoY5LFIrOxnBM0IdMtxX6-lTVGVPj5Ka3hF-LL7DnqwuhBafOBYig=s176-c-k-c0x00ffffff-no-rj-mo", // Fallback 1
    "https://images.unsplash.com/photo-1550614000-4b95d4ba113e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Fallback 2
    "https://images.unsplash.com/photo-1583391733959-b5f7ee290bf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"  // Fallback 3
  ]);

  // ✅ State for Image Carousel Index
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Fetch Images on Load
  useEffect(() => {
    axios.get(`${API_URL}/api/about`)
      .then(res => {
        if (res.data) {
          const images = [
            res.data.founderImage1,
            res.data.founderImage2,
            res.data.founderImage3
          ].filter(img => img); // Filter out empty strings if any
          
          if (images.length > 0) {
            setFounderImages(images);
          }
        }
      })
      .catch(err => console.error("Failed to load founder images:", err));
  }, []);

  // ✅ Auto Scroll Images Every 3 Seconds
  useEffect(() => {
    if (founderImages.length <= 1) return; // Don't scroll if only 1 image

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % founderImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [founderImages]);

  const values = [
    { icon: <Heart className="w-8 h-8" />, title: "Passion for Craftsmanship", description: "Every saree is created with love and dedication." },
    { icon: <Award className="w-8 h-8" />, title: "Quality Excellence", description: "We source only the finest materials." },
    { icon: <Users className="w-8 h-8" />, title: "Artisan Support", description: "Direct partnerships with skilled artisans." },
    { icon: <Shield className="w-8 h-8" />, title: "Authenticity", description: "Genuine handcrafted sarees." },
    { icon: <Globe className="w-8 h-8" />, title: "Sustainable Practices", description: "Ethical sourcing and eco-friendly processes." },
    { icon: <Sparkles className="w-8 h-8" />, title: "Innovation", description: "Blending centuries-old techniques with modern design." }
  ];

  const milestones = [
    { year: "2010", title: "Foundation", description: "Hansitha Creations founded with a vision for premium sarees" },
    { year: "2013", title: "Artisan Network", description: "Established partnerships with 50+ master artisans" },
    { year: "2016", title: "National Recognition", description: "Featured in major fashion exhibitions across India" },
    { year: "2019", title: "Digital Presence", description: "Launched online store reaching global customers" },
    { year: "2022", title: "Expansion", description: "Introduced sustainable and contemporary collections" },
    { year: "2025", title: "15+ Years", description: "Celebrating over a decade of excellence and trust" }
  ];

  const founder = {
    name: "KiranMai",
    role: "Founder & Creative Director",
    bio: "With over 15 years of experience in textile design, Hansitha's passion for sarees and hand-painting led to the creation of a brand that celebrates Indian craftsmanship while embracing modern elegance.",
    quote: "Every saree tells a story—a story of culture, craftsmanship, and timeless beauty."
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50 overflow-x-hidden">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-pink-400/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
             <div className="flex justify-center mb-6 md:mb-8">
                <div className="relative bg-white p-3 rounded-full shadow-lg">
                  <Heart className="w-10 h-10 md:w-12 md:h-12 text-pink-500" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Weaving Stories of <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent"> Tradition & Elegance</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Celebrating 15+ years of preserving India's rich textile heritage
              </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Traditional Saree Craftsmanship"
                className="w-full h-64 md:h-96 object-cover rounded-3xl shadow-xl"
              />
            </div>
            
            <div className="space-y-6 md:space-y-8">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <Palette className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Our Journey</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Our journey began with a vision to bring timeless Indian craftsmanship into the contemporary wardrobe. What started as a heartfelt passion for sarees and hand-painting has grown into a brand known for quality and artistic excellence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FOUNDER SECTION (AUTO-SCROLLING CAROUSEL) */}
        <div className="bg-gradient-to-r from-blue-500 to-pink-500 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                
                {/* Image Carousel Area */}
                <div className="relative h-64 sm:h-96 lg:h-full min-h-[400px] overflow-hidden bg-gray-100 group">
                  <AnimatePresence mode='wait'>
                    <motion.img 
                      key={currentIndex}
                      src={founderImages[currentIndex]}
                      alt={`Founder Image ${currentIndex + 1}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Founder Info Overlay */}
                  <div className="absolute bottom-6 left-6 text-white z-10">
                    <h3 className="text-2xl md:text-3xl font-bold">{founder.name}</h3>
                    <p className="text-sm md:text-base opacity-90">{founder.role}</p>
                  </div>

                  {/* Carousel Indicators */}
                  <div className="absolute bottom-6 right-6 flex gap-2 z-10">
                    {founderImages.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Content Side */}
                <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Our Founder's Vision</h2>
                  </div>
                  <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
                    {founder.bio}
                  </p>
                  <blockquote className="pl-6 border-l-4 border-pink-500 text-xl italic text-gray-800 mb-8">
                    "{founder.quote}"
                  </blockquote>
                  
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-700">15+ Years Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                      <span className="font-semibold text-gray-700">5000+ Happy Customers</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-blue-600 mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gradient-to-b from-white to-blue-50 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey Through Time</h2>
            </div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                  <div className="w-full md:w-1/3 text-center md:text-right font-bold text-blue-600 text-xl">{milestone.year}</div>
                  <div className="w-4 h-4 bg-pink-500 rounded-full hidden md:block"></div>
                  <div className="w-full md:w-2/3 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-gray-900">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </Layout>
  );
};

export default AboutPage;