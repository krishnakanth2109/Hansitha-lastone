const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");

const placeOrder = async (req, res) => {
  const {
    name,
    email,
    phone,
    amount,
    products,
    userId,
    razorpayPaymentId,
    razorpayOrderId,
  } = req.body;

  try {
    // 1. Save in Order collection
    const newOrder = await Order.create({
      name,
      email,
      phone,
      amount,
      status: "paid",
      products,
    });

    // 2. Save summary in user's orders[]
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user) {
        user.orders.push({
          products: products.map((p) => ({
            product: mongoose.Types.ObjectId(p.id),
            quantity: p.quantity,
          })),
          total: amount,
          paymentId: razorpayPaymentId || "",
          razorpayOrderId: razorpayOrderId || "",
        });

        // Optional: clear user's cart after order
        user.cart = [];

        await user.save();
        console.log("✅ Order also saved in user.orders");
      } else {
        console.warn("⚠️ User not found with ID:", userId);
      }
    } else {
      console.warn("⚠️ Invalid userId provided:", userId);
    }

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("❌ Failed to place order:", error);
    res.status(500).json({ success: false, error: "Failed to place order" });
  }
};

module.exports = { placeOrder };
