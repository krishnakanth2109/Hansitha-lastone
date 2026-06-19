// routes/webhook.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User.model');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// ✅ Route is '/' — full path is POST /api/webhook
// Set this URL in Razorpay Dashboard → Developers → Webhooks
router.post('/', express.raw({ type: '*/*' }), async (req, res) => {
  console.log('='.repeat(60));
  console.log('🔨 [Webhook] REQUEST RECEIVED at', new Date().toISOString());

  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.error('❌ RAZORPAY_WEBHOOK_SECRET not set in .env!');
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    console.error('❌ Missing x-razorpay-signature header');
    return res.status(400).json({ message: 'Missing signature' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('❌ Signature mismatch — wrong webhook secret or tampered payload');
    return res.status(400).json({ message: 'Invalid signature' });
  }

  console.log('✅ Signature verified');

  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  const event = payload.event;
  console.log('📣 Event:', event);

  try {
    if (event === 'payment_link.paid') {
      const entity = payload.payload.payment_link.entity;
      const orderId = entity.notes?.internal_order_id;

      if (!orderId) {
        console.error('❌ No internal_order_id in notes:', entity.notes);
        return res.status(400).json({ message: 'Order ID missing' });
      }

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (order.paymentStatus === 'paid') {
        console.log(`⚠️ Already paid — skipping`);
        return res.status(200).json({ success: true });
      }

      order.paymentStatus = 'paid';
      order.status = 'Placed';
      order.adminStatus = 'pending';
      order.razorpayPaymentLinkId = entity.id;
      await order.save();
      console.log(`✅ Order ${orderId}: paymentStatus=paid`);

      if (order.user) {
        await User.findByIdAndUpdate(order.user, { $set: { cart: [] } });
        console.log('✅ Cart cleared');
      }

      const io = req.app.get('io') || global.io;
      if (io) {
        const populated = await Order.findById(orderId).populate('user', 'name email');
        io.emit('orderUpdated', populated);
        io.emit('newOrder', populated);
        console.log('✅ Socket events emitted');

        // Send Order Confirmation Email
        if (populated && populated.user && populated.user.email) {
          await sendOrderConfirmationEmail(populated.user.email, populated);
        } else if (populated && populated.shippingAddress && populated.shippingAddress.email) {
          await sendOrderConfirmationEmail(populated.shippingAddress.email, populated);
        }
      }

      return res.status(200).json({ success: true, orderId });
    }

    if (event === 'payment_link.failed' || event === 'payment_link.cancelled' || event === 'payment_link.expired') {
      const entity = payload.payload.payment_link.entity;
      const orderId = entity.notes?.internal_order_id;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'failed';
          order.status = 'Cancelled';
          order.adminStatus = 'rejected';
          await order.save();
          console.log(`✅ Order ${orderId} marked failed/cancelled`);
          const io = req.app.get('io') || global.io;
          if (io) {
            const populated = await Order.findById(orderId).populate('user', 'name email');
            io.emit('orderUpdated', populated);
          }
        }
      }
      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ message: 'Event acknowledged' });

  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    return res.status(200).json({ message: 'Error handled' });
  }
});

module.exports = router;