const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.use(auth, adminAuth);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalOrders, totalRevenue, totalProducts, totalUsers, pendingOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments({ adminStatus: 'pending' })
    ]);
                           
    // Calculate revenue change
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const previousMonthRevenue = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $lt: thirtyDaysAgo }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const currentRevenue = totalRevenue[0]?.total || 0;
    const previousRevenue = previousMonthRevenue[0]?.total || 0;
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    res.json({
      totalRevenue: currentRevenue,
      totalOrders: totalOrders,
      totalProducts: totalProducts,
      totalUsers: totalUsers,
      pendingOrders: pendingOrders,
      revenueChange: parseFloat(revenueChange.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Get revenue chart data
router.get('/revenue', async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    let startDate = new Date();
    
    switch (range) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({ message: 'Failed to fetch revenue data' });
  }
});

// Get recent orders
router.get('/recent-orders', async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    res.json(recentOrders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ message: 'Failed to fetch recent orders' });
  }
});

// Get top products
router.get('/top-products', async (req, res) => {
  try {
    const topProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(topProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: 'Failed to fetch top products' });
  }
});

// Get order status distribution
router.get('/order-status', async (req, res) => {
  try {
    const statusData = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(statusData);
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ message: 'Failed to fetch order status data' });
  }
});

module.exports = router;


