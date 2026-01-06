const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// ✅ Razorpay webhook endpoint
router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const event = req.body.event;

  if (event === 'payment.captured') {
    try {
      const { email, address, cartItems, totalAmount } = req.body.payload.payment.entity.notes;

      // Step 1: Update stock
      const updatedStocks = [];
      for (const item of JSON.parse(cartItems)) {
        const product = await Product.findById(item.id);

        if (!product) {
          console.error(`Product ${item.id} not found`);
          continue;
        }

        if (product.stock < item.quantity) {
          console.error(`Insufficient stock for ${product.name}`);
          continue;
        }

        product.stock -= item.quantity;
        await product.save();

        updatedStocks.push({ productId: product._id, stock: product.stock });
      }

      // Step 2: Save order
      const newOrder = new Order({
        email,
        address,
        cartItems: JSON.parse(cartItems),
        totalAmount,
      });

      const savedOrder = await newOrder.save();

      // Step 3: Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.emit('newOrder', {
          _id: savedOrder._id,
          email: savedOrder.email,
          totalAmount: savedOrder.totalAmount,
          createdAt: savedOrder.createdAt,
        });
      }

      console.log('✅ Order created after payment:', savedOrder._id);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error creating order from webhook:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  res.status(200).json({ message: 'Webhook received but no action taken' });
});

module.exports = router;
