// server/routes/shippingRoutes.js (New File)

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const { trackShipmentByAwb } = require('../services/shiprocketService');

// GET tracking details for a specific order ID from our database
router.get('/track/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Security check: Ensure the user requesting the order is the one who owns it or an admin
        // Note: The logic might need adjustment based on how your user roles are structured
        if (order.user && order.user.toString() !== req.user.id) {
             return res.status(403).json({ message: 'User not authorized' });
        }
        
        // Check if AWB code exists
        const awbCode = order.shipmentDetails?.awbCode;
        if (!awbCode) {
            return res.status(200).json({ 
                message: 'Shipment not yet assigned an AWB code.',
                tracking_data: {
                    track_status: 0,
                    shipment_status: 1, // Corresponds to "AWB Assigned" or similar initial state
                    scans: []
                }
            });
        }
        
        // Fetch tracking data from Shiprocket
        const trackingData = await trackShipmentByAwb(awbCode);
        res.json(trackingData);

    } catch (error) {
        console.error(`Error fetching tracking for order ${req.params.orderId}:`, error);
        res.status(500).json({ message: 'Server Error while fetching tracking data.' });
    }
});

module.exports = router;