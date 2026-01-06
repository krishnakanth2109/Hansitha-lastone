import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

interface Props {
  apiUrl: string;
  onNewOrder?: (order: any) => void;
}

const OrderNotificationSound: React.FC<Props> = ({ apiUrl, onNewOrder }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load sound file
    audioRef.current = new Audio("/notification.mp3"); // put file in public/

    // Connect to Socket.IO
    const socket = io(apiUrl, {
      withCredentials: true,
      transports: ["websocket"], // skip HTTP polling
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    socket.on("newOrder", (newOrder) => {
      toast.success("🛒 New order received!");

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.warn("Audio play failed:", err);
        });
      }

      if (onNewOrder) onNewOrder(newOrder);
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl, onNewOrder]);

  return null;
};

export default OrderNotificationSound;
