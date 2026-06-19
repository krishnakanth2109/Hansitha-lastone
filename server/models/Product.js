const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },           // This will be the OFFER/FINAL price
  originalPrice: { type: Number, default: null },    // MRP / original price before discount
  discountPercentage: { type: Number, default: 0 },  // e.g. 20 means 20% off
  stock: { type: Number, required: true },
  image: { type: String, required: true },
  extraImages: { type: [String], default: [] },
  category: { type: String, required: true },
  description: { type: String, required: true },
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  ceoCollection: { type: Boolean, default: false },
}, { timestamps: true });

// ✅ Virtual: Auto-calculate offer price if not explicitly set
// price = final selling price (offer price)
// originalPrice = MRP
// discountPercentage = discount shown as badge

module.exports = mongoose.model('Product', ProductSchema);