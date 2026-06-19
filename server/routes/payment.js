// routes/payment.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
require("dotenv").config();

// ✅ Razorpay keys live ONLY in backend .env — never in frontend
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/payment-link
router.post("/payment-link", auth, async (req, res) => {
  const { totalAmount, cartItems, address, email, customer } = req.body;

  if (!totalAmount || !cartItems || cartItems.length === 0 || !address) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: totalAmount, cartItems, or address",
    });
  }

  try {
    console.log(`💳 [Payment] Creating order for user: ${req.user.id}`);
    console.log(`   Amount : ₹${totalAmount}`);
    console.log(`   Items  : ${cartItems.length}`);

    // STEP 1: Save order in DB with paymentStatus=pending
    const order = new Order({
      user: req.user.id,
      email: email || customer?.email || address?.email || "",
      address,
      cartItems,
      totalAmount,
      paymentStatus: "pending",
      adminStatus: "pending",
      status: "Placed",
    });
    await order.save();
    console.log(`✅ [Payment] Order saved: ${order._id}`);

    // STEP 2: Create Razorpay Payment Link
    const paymentLinkData = {
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      customer: {
        name: customer?.name || address?.name || "Customer",
        email: email || customer?.email || "",
        contact: customer?.phone || req.body.phone || "",
      },
      notify: { sms: true, email: true },
      notes: {
        // ✅ CRITICAL: webhook reads this to find the order in DB
        internal_order_id: order._id.toString(),
      },
      // ✅ FIXED: after payment Razorpay redirects to /track-order/:orderId
      // TrackingOrders.tsx reads :orderId from useParams and fetches the order
      callback_url: `${process.env.FRONTEND_URL}/track-order/${order._id}`,
      callback_method: "get",
      reminder_enable: true,
    };

    const paymentLink = await razorpay.paymentLink.create(paymentLinkData);
    console.log(`✅ [Payment] Razorpay link created: ${paymentLink.short_url}`);

    // STEP 3: Save payment link ID
    order.razorpayPaymentLinkId = paymentLink.id;
    await order.save();

    // ✅ Response: { success, url, orderId }
    // Checkout.tsx reads res.data.url to redirect user
    res.json({
      success: true,
      url: paymentLink.short_url,
      orderId: order._id,
      message: "Payment link created successfully",
    });

  } catch (err) {
    console.error("❌ [Payment] Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to create payment link",
      error: err.message,
    });
  }
});

module.exports = router;