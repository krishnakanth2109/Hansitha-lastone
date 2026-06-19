import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Auto-select backend URL depending on environment
const SOCKET_URL = import.meta.env.PROD
  ? "wss://hansitha-web-backend.onrender.com"
  : "http://localhost:8080";

// Connect and initialize the socket
export const connectSocket = () => {
  if (socket && socket.connected) {
    console.warn("⚠️ Socket is already connected.");
    return;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"], // fallback to polling if websocket fails
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🟢 WebSocket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 WebSocket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ WebSocket connection error:", err.message);
  });
};

// Get current socket instance
export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error("Socket not initialized. Call connectSocket() first.");
  }
  return socket;
};

// Optional: disconnect function
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("🔌 Socket manually disconnected.");
    socket = null;
  }
};
