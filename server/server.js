// Core Dependencies
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

// Env Setup
dotenv.config();
const app = express();
app.set("trust proxy", 1); // Required for proxy environments like Render
const server = http.createServer(app);

// ✅ Allowed Origins Setup
const allowedOrigins = [
  "http://localhost:8080",
  "https://hansithacreations.com",
  "https://hansithacreations.netlify.app",
  "https://hansitha-web-storefront.onrender.com",
  "https://hansithacreations.liveblog365.com",
  "https://hansitha-creations-1.onrender.com",
  "https://hansitha-creations.netlify.app",
  "https://hansitha-lastone.onrender.com"
];

// ✅ Socket.IO CORS Config
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ✅ CRITICAL: Make io accessible to all routes (BOTH methods for maximum compatibility)
global.io = io;
app.set('io', io);

// ✅ Express Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Multer Config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "web-store",
  })
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("🔌 Client Connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("🔌 Client Disconnected:", socket.id);
  });
});

// ===========================================
// ✅ ROUTE IMPORTS
// ===========================================
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/categories");
const checkoutRoutes = require("./routes/checkoutRoutes");
const webhookRoutes = require("./routes/webhook");
const productRoutes = require("./routes/productRoutes");
const otpRoutes = require("./routes/otpRoutes");
const orderRoutes = require("./routes/orderRoutes"); // User Orders
const paymentRoutes = require("./routes/payment");
const shippingRoutes = require("./routes/shippingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminOrderRoutes = require("./routes/adminOrderRoutes"); // Admin Dashboard
const aboutRoutes = require("./routes/aboutRoutes.js");
const subscriberRoutes = require("./routes/subscriberRoutes.js");
// ===========================================
// ✅ ROUTE REGISTRATION
// ===========================================

// Health check
app.get("/", (req, res) => res.status(200).send("Backend is live"));

// ⚠️ IMPORTANT: Webhook MUST be registered BEFORE other routes
// This prevents body parsing issues with Razorpay signature verification
app.use("/api/webhook", webhookRoutes); // Razorpay Webhook - MUST BE FIRST

// Admin Routes
app.use("/api/admin/orders", adminOrderRoutes);

// Feature Routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/checkout", checkoutRoutes); 
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/auth", otpRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/subscribers", subscriberRoutes);
// ===========================================
// ✅ EXTRA FEATURES (Inline)
// ===========================================

// 1. Announcements
const Announcement = require("./models/Announcement");
const announcementRoutes = require("express").Router();

announcementRoutes.get("/", async (req, res) => {
  try {
    const data = await Announcement.findOne({});
    res.json(data || { messages: [], isActive: false });
  } catch (err) {
    res.status(500).json({ error: "Failed to load announcement" });
  }
});

announcementRoutes.post("/", async (req, res) => {
  try {
    const { messages, isActive } = req.body;
    const updated = await Announcement.findOneAndUpdate(
      {},
      { messages, isActive },
      { upsert: true, new: true }
    );
    global.io.emit("refresh");
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update announcement" });
  }
});
app.use("/api/announcements", announcementRoutes);

// 2. Carousel Image Model & Routes
const ImageSchema = new mongoose.Schema({
  carouselId: { type: String, required: true, unique: true },
  imageUrl: { type: String, default: "" },
  mobileImageUrl: { type: String, default: "" },
});
const ImageModel = mongoose.model("Image", ImageSchema);

app.post(
  "/api/upload-carousel",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { carouselId } = req.body;
      if (!carouselId)
        return res.status(400).json({ message: "Missing carouselId" });

      let existing = await ImageModel.findOne({ carouselId });
      if (!existing) existing = new ImageModel({ carouselId });

      if (req.files?.image?.[0]) {
        const base64 = `data:${req.files.image[0].mimetype};base64,${req.files.image[0].buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64, {
          folder: "carousel_images",
        });
        existing.imageUrl = result.secure_url;
      }

      if (req.files?.mobileImage?.[0]) {
        const base64 = `data:${req.files.mobileImage[0].mimetype};base64,${req.files.mobileImage[0].buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64, {
          folder: "carousel_images/mobile",
        });
        existing.mobileImageUrl = result.secure_url;
      }

      await existing.save();
      res.json({ success: true, message: "Carousel updated successfully." });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ success: false, message: "Upload failed", error: err.message });
    }
  }
);

app.delete("/api/delete-carousel/:carouselId", async (req, res) => {
  try {
    const { carouselId } = req.params;
    const deleted = await ImageModel.findOneAndDelete({ carouselId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Carousel not found" });
    }

    res.json({ success: true, message: "Carousel deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Failed to delete carousel" });
  }
});

app.get("/api/carousel-images", async (req, res) => {
  try {
    const images = await ImageModel.find({});
    res.json(images);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to load images" });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for real-time updates`);
  console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/api/webhook/webhook`);
  console.log(`✅ Server initialization complete`);
});