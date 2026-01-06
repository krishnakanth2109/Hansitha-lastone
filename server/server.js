// ================= CORE DEPENDENCIES =================
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

// ================= ROUTES =================
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/categories");
const checkoutRoutes = require("./routes/checkoutRoutes");
const webhookRoutes = require("./routes/webhook");
const productRoutes = require("./routes/productRoutes");
const otpRoutes = require("./routes/otpRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/payment");
const shippingRoutes = require("./routes/shippingRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const geocodeRoutes = require("./routes/geocodeRoutes");

// ================= ENV SETUP =================
dotenv.config();

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

// ================= ALLOWED ORIGINS =================
const allowedOrigins = [
  "http://localhost:8080",
  "https://hansithacreations.com",
  "https://hansitha-creations.netlify.app",
  "https://hansitha-web-storefront.onrender.com",
  "https://hansithacreations.liveblog365.com",
  "https://hansitha-creations-1.onrender.com",
  "https://hansitha-lastone.onrender.com",
];

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
global.io = io;

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
});

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ================= CLOUDINARY =================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ================= MULTER =================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "web-store",
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ================= MODELS =================
const Announcement = require("./models/Announcement");

const ImageSchema = new mongoose.Schema({
  carouselId: { type: String, required: true, unique: true },
  imageUrl: String,
  mobileImageUrl: String,
});
const ImageModel = mongoose.model("Image", ImageSchema);

const NewsletterSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});
const Newsletter = mongoose.model("Newsletter", NewsletterSchema);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => res.status(200).send("Backend is live 🚀"));

// ================= ROUTES =================
app.use("/api/payment", paymentRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/auth", otpRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/geocode", geocodeRoutes);

// ================= ANNOUNCEMENTS =================
app.get("/api/announcements", async (req, res) => {
  try {
    const data = await Announcement.findOne({});
    res.json(data || { messages: [], isActive: false });
  } catch {
    res.status(500).json({ error: "Failed to load announcement" });
  }
});

app.post("/api/announcements", async (req, res) => {
  try {
    const updated = await Announcement.findOneAndUpdate(
      {},
      req.body,
      { upsert: true, new: true }
    );
    global.io.emit("refresh");
    res.json({ success: true, updated });
  } catch {
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

// ================= CAROUSEL =================
app.post(
  "/api/upload-carousel",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { carouselId } = req.body;
      if (!carouselId) return res.status(400).json({ message: "Missing carouselId" });

      let item = await ImageModel.findOne({ carouselId });
      if (!item) item = new ImageModel({ carouselId });

      if (req.files?.image) {
        const base64 = `data:${req.files.image[0].mimetype};base64,${req.files.image[0].buffer.toString("base64")}`;
        const uploadRes = await cloudinary.uploader.upload(base64, { folder: "carousel" });
        item.imageUrl = uploadRes.secure_url;
      }

      if (req.files?.mobileImage) {
        const base64 = `data:${req.files.mobileImage[0].mimetype};base64,${req.files.mobileImage[0].buffer.toString("base64")}`;
        const uploadRes = await cloudinary.uploader.upload(base64, { folder: "carousel/mobile" });
        item.mobileImageUrl = uploadRes.secure_url;
      }

      await item.save();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get("/api/carousel-images", async (req, res) => {
  const images = await ImageModel.find({});
  res.json(images);
});

// ================= NEWSLETTER =================
app.post("/api/newsletter", async (req, res) => {
  try {
    const exists = await Newsletter.findOne({ email: req.body.email });
    if (exists) return res.status(409).json({ message: "Already subscribed" });

    await new Newsletter(req.body).save();
    res.status(201).json({ message: "Subscribed successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 10000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
