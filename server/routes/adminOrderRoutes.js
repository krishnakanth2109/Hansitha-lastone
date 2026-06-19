// routes/adminOrderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { sendOrderStatusEmail } = require('../utils/emailService');

router.use(auth, adminAuth);

// ========================================
// GET ALL ORDERS
// ========================================
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// ========================================
// UPDATE ORDER STATUS (Admin changes status directly)
// ========================================
router.patch('/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = [
            "Placed", "Processing", "Shipped", "In Transit",
            "Delivered", "Undelivered", "Return In Progress",
            "Returned", "Refunded", "Cancelled"
        ];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Only allow status changes on paid orders
        if (order.paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Cannot change status of an unpaid order' });
        }

        console.log(`🔄 Order ${order._id}: status → ${status}`);
        order.status = status;
        // Mark as approved when admin moves it past Placed
        if (order.adminStatus === 'pending' && status !== 'Placed' && status !== 'Cancelled') {
            order.adminStatus = 'approved';
        }

        const updated = await order.save();
        await updated.populate('user', 'name email');

        const io = req.app.get('io') || global.io;
        if (io) io.emit('orderStatusUpdated', updated);

        // Send status email to user
        if (updated.user && updated.user.email) {
            sendOrderStatusEmail(updated.user.email, updated).catch(console.error);
        } else if (updated.shippingAddress && updated.shippingAddress.email) {
            sendOrderStatusEmail(updated.shippingAddress.email, updated).catch(console.error);
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error('❌ Error updating status:', error);
        res.status(500).json({ message: 'Failed to update status' });
    }
});

// ========================================
// UPDATE TRACKING DETAILS
// ========================================
router.patch('/:orderId/shipping', async (req, res) => {
    try {
        const { awbCode, courierName } = req.body;

        if (!awbCode && !courierName) {
            return res.status(400).json({ message: 'Provide awbCode or courierName' });
        }

        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        console.log(`🚚 Tracking update for order ${order._id}: ${courierName} / ${awbCode}`);

        order.trackingDetails = {
            awbCode: awbCode || order.trackingDetails?.awbCode || '',
            courierName: courierName || order.trackingDetails?.courierName || ''
        };

        // Auto-advance to Shipped when AWB added
        if (awbCode && (order.status === 'Processing' || order.status === 'Placed')) {
            order.status = 'Shipped';
        }

        const updated = await order.save();
        await updated.populate('user', 'name email');

        // Add shipmentDetails alias for frontend compatibility
        const response = updated.toObject();
        response.shipmentDetails = response.trackingDetails;

        const io = req.app.get('io') || global.io;
        if (io) io.emit('orderStatusUpdated', response);

        // Send status email to user for shipping update
        if (updated.user && updated.user.email) {
            sendOrderStatusEmail(updated.user.email, updated).catch(console.error);
        } else if (updated.shippingAddress && updated.shippingAddress.email) {
            sendOrderStatusEmail(updated.shippingAddress.email, updated).catch(console.error);
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('❌ Error updating shipping:', error);
        res.status(500).json({ message: 'Failed to update shipping details' });
    }
});

module.exports = router;