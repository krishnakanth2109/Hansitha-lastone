const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// GET all orders for the logged-in user
router.get('/my-orders', auth, async (req, res) => {
    try {
        console.log(`📦 Fetching orders for user: ${req.user.id}`);
        
        // Fetch orders with no caching
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .lean(); // Use lean() for better performance
        
        console.log(`✅ Found ${orders.length} orders`);
        console.log('Payment statuses:', orders.map(o => `${o._id.toString().slice(-6)}: ${o.paymentStatus}`));
        
        // Set no-cache headers
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.json(orders);
    } catch (error) {
        console.error("❌ Error fetching user orders:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET a single order by its ID (with no caching)
router.get('/:orderId', auth, async (req, res) => {
    try {
        console.log(`📦 Fetching single order: ${req.params.orderId}`);
        
        const order = await Order.findById(req.params.orderId).lean();

        if (!order) {
            console.log('❌ Order not found');
            return res.status(404).json({ message: 'Order not found' });
        }

        // Security Check
        if (order.user.toString() !== req.user.id) {
            console.log('❌ Unauthorized access attempt');
            return res.status(403).json({ message: 'User not authorized to view this order' });
        }

        console.log(`✅ Order found: paymentStatus="${order.paymentStatus}", status="${order.status}"`);
        
        // Set no-cache headers
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.json(order);
    } catch (error) {
        console.error("❌ Error fetching single order:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;