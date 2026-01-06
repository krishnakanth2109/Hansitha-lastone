import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
});

const LiveReloadListener = () => {
  useEffect(() => {
    socket.on("refresh", () => {
      console.log("🔁 Refresh triggered from backend");
      window.location.reload();
    });

    return () => {
      socket.off("refresh");
    };
  }, []);

  return null;
};

export default LiveReloadListener;
