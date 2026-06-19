// server/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Subscriber = require("../models/Subscriber");
const { sendNewProductEmail } = require("../utils/emailService");

// ✅ Setup Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Setup Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
// 🚀 AI Image Search Route
// ==========================================
router.post("/image-search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Analyze this clothing/fabric product image. 
      Return ONLY a comma-separated list of 3 to 5 highly relevant keywords 
      describing the color, fabric, pattern, and style. 
      Do not include any other text or explanation.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType } },
    ]);

    const aiResponse = result.response.text();
    const keywords = aiResponse
      .split(",")
      .map((k) => k.trim().replace(/[^a-zA-Z0-9 ]/g, ""))
      .filter((k) => k.length > 0);

    const regexQueries = keywords.map((kw) => new RegExp(kw, "i"));
    const products = await Product.find({
      $or: [
        { name: { $in: regexQueries } },
        { category: { $in: regexQueries } },
        { description: { $in: regexQueries } },
      ],
    }).limit(10);

    res.json({ success: true, extractedKeywords: keywords, products });
  } catch (err) {
    console.error("AI Image Search Error:", err);
    res.status(500).json({ message: "Failed to process image search" });
  }
});

// ==========================================
// ✅ Create Product
// ==========================================
router.post("/", async (req, res) => {
  try {
    const {
      name, price, originalPrice, discountPercentage,
      image, featured, newArrival, ceoCollection,
      category, stock, description, extraImages = []
    } = req.body;

    // Auto-calculate discount percentage if originalPrice is provided but discountPercentage is not
    let finalDiscount = discountPercentage || 0;
    if (originalPrice && originalPrice > price && !discountPercentage) {
      finalDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    // Auto-calculate offer price if originalPrice & discountPercentage provided but no price
    let finalPrice = price;
    if (originalPrice && discountPercentage && !price) {
      finalPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
    }

    const product = new Product({
      name, price: finalPrice, originalPrice: originalPrice || null,
      discountPercentage: finalDiscount,
      image, featured, newArrival, ceoCollection,
      category, stock, description, extraImages
    });

    const saved = await product.save();

    // Send email to all subscribers about the new product
    try {
      const subscribers = await Subscriber.find().select('email');
      const emails = subscribers.map(sub => sub.email);
      
      if (emails.length > 0) {
        // Run this asynchronously so it doesn't block the API response
        sendNewProductEmail(emails, saved).catch(console.error);
      }
    } catch (emailErr) {
      console.error("❌ Failed to send new product emails:", emailErr);
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// ==========================================
// ✅ Get All Products or Product by Name
// ==========================================
router.get("/", async (req, res) => {
  try {
    const name = req.query.name;
    if (name) {
      const decodedName = decodeURIComponent(name);
      const product = await Product.find({ name: { $regex: new RegExp(`^${decodedName}$`, "i") } });
      if (!product || product.length === 0) return res.status(404).json({ message: "Product not found" });
      return res.json(product);
    }
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product(s)" });
  }
});

// ==========================================
// ✅ Search by Query (partial match)
// ==========================================
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || "";
    const regex = new RegExp(query, "i");
    const results = await Product.find({ name: regex }).limit(10);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// ==========================================
// ✅ Get Product by ID
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// ✅ Update Product by ID
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const {
      name, price, originalPrice, discountPercentage,
      image, featured, newArrival, ceoCollection,
      category, stock, description, extraImages = []
    } = req.body;

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    // Auto-calculate discount % if originalPrice and price are given
    let finalDiscount = discountPercentage ?? existing.discountPercentage ?? 0;
    const newOriginalPrice = originalPrice ?? existing.originalPrice;
    const newPrice = price ?? existing.price;

    if (newOriginalPrice && newOriginalPrice > newPrice && discountPercentage === undefined) {
      finalDiscount = Math.round(((newOriginalPrice - newPrice) / newOriginalPrice) * 100);
    }

    const updatedFields = {
      name: name ?? existing.name,
      price: newPrice,
      originalPrice: newOriginalPrice,
      discountPercentage: finalDiscount,
      image: image ?? existing.image,
      featured: featured ?? existing.featured,
      newArrival: newArrival ?? existing.newArrival,
      ceoCollection: ceoCollection ?? existing.ceoCollection,
      category: category ?? existing.category,
      stock: stock ?? existing.stock,
      description: description ?? existing.description,
      extraImages: Array.isArray(extraImages) ? extraImages : existing.extraImages,
    };

    if (updatedFields.stock < 0) return res.status(400).json({ message: "Stock cannot be negative" });

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
    res.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ==========================================
// ✅ Delete Product by ID
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;