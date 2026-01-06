import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Slide {
  imageUrl: string;
  mobileImageUrl?: string;
}

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [fade, setFade] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/carousel-images`);
        const parsedSlides = res.data.map((item: any) => ({
          imageUrl: item.imageUrl || 'https://via.placeholder.com/1600x600?text=Banner',
          mobileImageUrl: item.mobileImageUrl || 'https://via.placeholder.com/800x600?text=Mobile+Banner',
        }));
        setSlides(parsedSlides);
      } catch (err) {
        console.error('Failed to fetch carousel data', err);
      }
    };

    fetchSlides();
  }, []);

  // Start auto scroll after images loaded
  useEffect(() => {
    if (slides.length === 0) return;

    startAutoScroll();
    return () => stopAutoScroll();
  }, [slides]);

  const startAutoScroll = () => {
    stopAutoScroll();
    intervalRef.current = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setFade(false);
      }, 300);
    }, 3000);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMouseEnter = () => stopAutoScroll();
  const handleMouseLeave = () => startAutoScroll();

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-gray-500 text-lg">Banners are Loading...</p>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <section className="w-full">
      <div
        className="relative w-full max-h-[600px] overflow-hidden"
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={isMobile && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl}
          alt="Banner"
          loading="eager" 
          className={`w-full h-auto max-h-[600px] object-cover transition-opacity duration-300 ${
            fade ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
    </section>
  );
};
