// routes/checkout.js or routes/payment.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Order = require("../models/Order"); // ✅ Ensure correct path

require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/payment-link", async (req, res) => {
  const { amount, cartItems, customer } = req.body;

  try {
    // ✅ Save order to MongoDB
    const order = new Order({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      amount,
      cartItems,
      status: "pending",
    });

    await order.save(); // 🔥 This is what actually stores it

    // ✅ Create Razorpay Payment Link
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100, // Razorpay accepts in paise
      currency: "INR",
      customer: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      notify: {
        sms: true,
        email: true,
      },
      callback_url: `${process.env.BASE_URL}/api/payment/verify`,
      callback_method: "get",
    });

    res.json({ url: paymentLink.short_url });
  } catch (err) {
    console.error("Payment link error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
