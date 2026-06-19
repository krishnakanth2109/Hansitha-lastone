import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const AnnouncementBar = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/announcements`);
        const contentType = res.headers.get("content-type");

        if (!res.ok || !contentType?.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Bad response: ${text}`);
        }

        const data = await res.json();
        setMessages(data.messages || []);
        setIsActive(data.isActive ?? true);
      } catch (error) {
        console.error("❌ Fetch error:", error);
      }
    };
    fetchAnnouncements();
  }, [API_BASE]);

  useEffect(() => {
    if (!isActive || messages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive, messages]);

  if (!isActive || messages.length === 0) return null;

  return (
    /* bg-[#BC3E82] matches the vibrant pink from your logo script */
    <div className="h-12 bg-[#BC3E82] border-b border-pink-700/20 overflow-hidden flex items-center justify-center shadow-sm">
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            /* White text looks professional and elegant on this pink background */
            className="absolute text-center font-semibold text-white px-4 tracking-wide text-sm md:text-base"
          >
            {messages[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnnouncementBar;