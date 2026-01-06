// server/routes/checkoutRoutes.js (REPLACE ENTIRE FILE)

const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product"); // We need this to decrement stock

// Ensure your Razorpay keys are loaded
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("FATAL ERROR: Razorpay keys are not defined in .env");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/payment-link", async (req, res) => {
  console.log("[Checkout] Received request to create a payment link.");
  
  try {
    const { user, address, cartItems, totalAmount } = req.body;

    if (!user || !address || !cartItems?.length || !totalAmount) {
      return res.status(400).json({ error: "Missing required fields for checkout." });
    }

    // --- Step 1: Decrement Stock Immediately ---
    for (const item of cartItems) {
        const product = await Product.findById(item.id);
        if (!product || product.stock < item.quantity) {
            return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
        }
        product.stock -= item.quantity;
        await product.save();
    }
    console.log(`[Checkout] Stock decremented for order.`);

    // --- Step 2: Create a PENDING Order in Your Database FIRST ---
    const newOrder = new Order({
      user: user.id,
      email: user.email,
      address: address,
      cartItems: cartItems,
      totalAmount: totalAmount,
      paymentStatus: "pending", // The crucial initial status
    });
    await newOrder.save();
    console.log(`[Checkout] Saved 'pending' order to database with ID: ${newOrder._id}`);

    // --- Step 3: Create the Razorpay Payment Link ---
    const razorpayPayload = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      description: `Order #${newOrder._id.toString()}`,
      customer: {
        name: address.name,
        email: user.email,
        contact: address.phone,
      },
      // ✅ Pass our internal order ID to the webhook via notes
      notes: {
        internal_order_id: newOrder._id.toString(),
      },
      // ✅ Redirect the user to our tracking page with the order ID
      callback_url: `${process.env.FRONTEND_URL}/tracking-orders?order_id=${newOrder._id.toString()}`,
      callback_method: "get",
    };

    const paymentLink = await razorpay.paymentLink.create(razorpayPayload);

    if (!paymentLink || !paymentLink.short_url) {
      throw new Error("Invalid response from Razorpay.");
    }

    // --- Step 4: Save Razorpay Link ID to our order for reference ---
    newOrder.razorpayPaymentLinkId = paymentLink.id;
    await newOrder.save();

    console.log(`[Checkout] Successfully created Razorpay link: ${paymentLink.short_url}`);
    return res.status(200).json({ paymentLink });

  } catch (err) {
    console.error("❌ [Checkout] An unexpected error occurred:", err);
    res.status(500).json({ error: "Failed to create payment link." });
  }
});

module.exports = router;