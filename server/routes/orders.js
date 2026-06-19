// --- START OF FILE: server/routes/orders.js ---

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

// GET a single order by its ID
router.get('/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Ensure the user requesting the order is the one who owns it
        if (order.user.toString() !== req.user.id) {
             return res.status(403).json({ message: 'User not authorized' });
        }
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;


// --- START OF FILE: server/routes/shipping.js ---
