// server/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Apply auth and adminAuth middleware to all routes in this file
router.use(auth, adminAuth);

// @route   GET /api/notifications
// @desc    Get all recent notifications for admin
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    // Fetch the 50 most recent notifications
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get the count of unread notifications
// @access  Private/Admin
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PATCH /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private/Admin
router.patch('/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;