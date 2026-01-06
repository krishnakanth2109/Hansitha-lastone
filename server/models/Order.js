// server/models/Order.js (ADD THE HIGHLIGHTED LINE)

const mongoose = require("mongoose");

const shipmentDetailsSchema = new mongoose.Schema({
    shiprocketOrderId: { type: Number },
    shipmentId: { type: Number },
    status: { type: String },
    awbCode: { type: String },
    courierName: { type: String },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  email: { 
    type: String, 
    required: true 
  },
  address: { 
    type: Object, 
    required: true 
  },
  cartItems: { 
    type: Array, 
    required: true 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  razorpayPaymentLinkId: { type: String }, // <-- ADD THIS LINE
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"], // Added "failed" for robustness
    default: "pending"
  },
  adminStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  status: {
    type: String,
    enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Placed"
  },
  shipmentDetails: shipmentDetailsSchema, 
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);