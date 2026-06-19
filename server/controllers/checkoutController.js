// routes/checkoutController.js
const Order = require('../models/Order');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/checkout/payment-link
const createPaymentLink = async (req, res) => {
  try {
    const { user, address, cartItems, totalAmount } = req.body;

    if (!user || !address || !cartItems || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields: user, address, cartItems, totalAmount' });
    }

    const userId = user.id || user._id;
    const userEmail = user.email;

    // ✅ Step 1: Save order with paymentStatus: "pending"
    // Stays hidden from user until webhook confirms payment
    const newOrder = new Order({
      user: userId,
      email: userEmail,
      address,
      cartItems,
      totalAmount,
      paymentStatus: 'pending',
      status: 'Placed',
    });

    await newOrder.save();
    console.log(`✅ Order created: ${newOrder._id} (paymentStatus: pending)`);

    // ✅ Step 2: Create Razorpay Payment Link
    // CRITICAL: notes.internal_order_id must match what webhook.js reads
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      description: 'Hansitha Creations Order',
      customer: {
        name: address.name || 'Customer',
        email: userEmail,
      },
      notify: { sms: false, email: true },
      reminder_enable: false,
      notes: {
        internal_order_id: newOrder._id.toString(), // ← webhook.js reads THIS key
        userId: userId.toString(),
      },
      callback_url: `${process.env.FRONTEND_URL}/payment-success?orderId=${newOrder._id}`,
      callback_method: 'get',
    });

    // ✅ Step 3: Store Razorpay link ID on the order
    newOrder.razorpayPaymentLinkId = paymentLink.id;
    await newOrder.save();

    console.log(`🔗 Payment link created: ${paymentLink.short_url}`);

    res.status(201).json({ paymentLink });

  } catch (err) {
    console.error('❌ Checkout Error:', err);
    res.status(500).json({ error: 'Failed to create payment link', details: err.message });
  }
};

module.exports = { createPaymentLink };