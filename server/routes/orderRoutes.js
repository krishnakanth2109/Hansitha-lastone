// server/routes/orderRoutes.js (REPLACE ENTIRE FILE)

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User.model');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { createShiprocketOrder, assignCourierAndGetAwb } = require('../services/shiprocketService');

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// GET A SINGLE ORDER BY ITS ID
router.get('/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to view this order' });
        }
        res.json(order);
    } catch (error) {
        console.error(`Error fetching order ${req.params.orderId}:`, error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// RAZORPAY WEBHOOK (UPDATED WITH BETTER LOGGING)
router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    console.log('[Webhook] Received a request from Razorpay.');

    try {
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('❌ [Webhook] Invalid Razorpay signature.');
            return res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('❌ [Webhook] Error during signature verification:', error.message);
        return res.status(500).json({ message: 'Signature verification failed.' });
    }

    const event = req.body.event;
    console.log(`[Webhook] Event type: ${event}`);

    if (event === 'payment_link.paid') {
        try {
            const paymentEntity = req.body.payload.payment_link.entity;
            const orderId = paymentEntity.notes.internal_order_id;

            if (!orderId) {
                console.error('❌ [Webhook] CRITICAL: internal_order_id not found in webhook notes payload.');
                return res.status(400).json({ message: 'Order ID missing from webhook.' });
            }
            console.log(`[Webhook] Processing payment for internal order ID: ${orderId}`);

            const order = await Order.findById(orderId);
            if (!order) {
                console.error(`❌ [Webhook] CRITICAL: Order with ID ${orderId} not found in the database.`);
                return res.status(404).json({ message: 'Order not found' });
            }

            if (order.paymentStatus === 'paid') {
                console.warn(`[Webhook] Order ${orderId} is already marked as 'paid'. Skipping processing.`);
                return res.status(200).json({ success: true, message: "Order already processed." });
            }

            order.paymentStatus = 'paid';
            order.status = 'Placed';
            await order.save();
            console.log(`✅ [Webhook] Order ${orderId} status updated to 'paid' in the database.`);

            if (order.user) {
                await User.findByIdAndUpdate(order.user, { $set: { cart: [] } });
                console.log(`✅ [Webhook] Cleared cart for user ${order.user}.`);
            }

            try {
                console.log(`🚀 [Shiprocket] Attempting to create shipment for order ${orderId}...`);
                const shiprocketOrder = await createShiprocketOrder(order);
                console.log(`[Shiprocket] Order created with ID: ${shiprocketOrder.order_id}, Shipment ID: ${shiprocketOrder.shipment_id}`);

                const awbData = await assignCourierAndGetAwb(shiprocketOrder.shipment_id);
                console.log(`[Shiprocket] AWB data received:`, awbData.data);

                order.shipmentDetails = {
                    shiprocketOrderId: shiprocketOrder.order_id,
                    shipmentId: shiprocketOrder.shipment_id,
                    status: awbData.data.status,
                    awbCode: awbData.data.awb_code,
                    courierName: awbData.data.courier_name,
                };
                await order.save();
                console.log(`✅ [Shiprocket] Successfully assigned AWB ${awbData.data.awb_code} to order ${orderId}.`);
                
                const io = req.app.get('io');
                if (io) io.emit('newOrder', order);

            } catch (shiprocketError) {
                console.error(`❌ [Shiprocket] CRITICAL: Failed to process shipment for order ${orderId}. The order is paid but shipment failed. Manual intervention required.`, shiprocketError);
                order.adminStatus = 'shipping_error'; // Flag for admin
                await order.save();
            }

            return res.status(200).json({ success: true, message: "Webhook processed." });

        } catch (error) {
            console.error('❌ [Webhook] Unhandled error during webhook processing:', error);
            return res.status(500).json({ message: 'Server error during webhook processing' });
        }
    }

    return res.status(200).json({ message: 'Webhook received but no action taken for this event.' });
});

module.exports = router;