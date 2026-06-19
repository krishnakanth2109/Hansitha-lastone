const mongoose = require("mongoose");

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
  razorpayPaymentLinkId: { 
    type: String 
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  adminStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  status: {
    type: String,
    enum: [
      "Placed",
      "Processing",
      "Shipped",
      "In Transit",
      "Delivered",
      "Undelivered",
      "Return In Progress",
      "Returned",
      "Refunded",
      "Cancelled"
    ],
    default: "Placed"
  },
  // Manual tracking information (no Shiprocket integration)
  trackingDetails: {
    awbCode: { type: String },
    courierName: { type: String }
  }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);