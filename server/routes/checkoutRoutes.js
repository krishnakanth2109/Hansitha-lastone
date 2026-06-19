// routes/checkoutRoutes.js
// ✅ The duplicate router.post('/payment-link', createPaymentLink) has been REMOVED.
//
// WHY IT WAS BREAKING EVERYTHING:
// The old file had TWO routes for POST /payment-link:
//   1. router.post('/payment-link', createPaymentLink)   ← no auth, ran first, crashed
//   2. router.post('/payment-link', auth, async ...)     ← never reached
//
// Express stops at the FIRST matching route. The first one had no auth middleware
// and called a controller that likely failed, sending a 500 back to the frontend.
// That made Checkout.tsx throw an error and the order appeared as failed — even
// though Razorpay later received the payment fine.
//
// The correct payment link creation is now ONLY in:
//   routes/payment.js  →  POST /api/payment/payment-link
//
// Checkout.tsx calls: axios.post(`${API_URL}/api/payment/payment-link`, ...)

const express = require("express");
const router = express.Router();

// No routes needed here — payment flow is fully in payment.js
// Keep this file so server.js import doesn't break

module.exports = router;