// server/routes/adminOrderRoutes.js (NEW FILE)

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createShiprocketOrder, assignCourierAndGetAwb } = require('../services/shiprocketService');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// All routes in this file require the user to be a logged-in admin
router.use(auth, adminAuth);

// GET all orders for the admin dashboard
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// PATCH - APPROVE an order and send to Shiprocket
router.patch('/:orderId/approve', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order || order.adminStatus !== 'pending') {
            return res.status(400).json({ message: 'Order not found or cannot be approved.' });
        }

        console.log(`🚀 [Admin] Approving order ${order._id}, creating Shiprocket order...`);
        const shiprocketOrder = await createShiprocketOrder(order);
        const awbData = await assignCourierAndGetAwb(shiprocketOrder.shipment_id);
        console.log(`✅ [Admin] Order ${order._id} approved and updated with AWB.`);

        order.adminStatus = 'approved';
        order.status = 'Processing';
        order.shipmentDetails = {
            shiprocketOrderId: shiprocketOrder.order_id,
            shipmentId: shiprocketOrder.shipment_id,
            status: awbData.data.status,
            awbCode: awbData.data.awb_code,
            courierName: awbData.data.courier_name,
        };

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);

    } catch (error) {
        console.error(`❌ [Admin] Failed to approve order ${req.params.orderId}:`, error);
        res.status(500).json({ message: 'Failed to approve order and process shipment.' });
    }
});

// PATCH - REJECT an order
router.patch('/:orderId/reject', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order || order.adminStatus !== 'pending') {
            return res.status(400).json({ message: 'Order not found or cannot be rejected.' });
        }

        order.adminStatus = 'rejected';
        order.status = 'Cancelled';
        
        for (const item of order.cartItems) {
            await Product.findByIdAndUpdate(item.id, { $inc: { stock: item.quantity } });
        }
        console.log(`[Admin] Stock returned for rejected order ${order._id}.`);
        
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);

    } catch (error) {
        console.error(`❌ [Admin] Failed to reject order ${req.params.orderId}:`, error);
        res.status(500).json({ message: 'Failed to reject order.' });
    }
});

module.exports = router;