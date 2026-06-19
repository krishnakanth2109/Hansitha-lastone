const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const { sendSubscriptionEmail } = require('../utils/emailService');

// @route   POST /api/subscribers
// @desc    Subscribe to newsletter
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if already subscribed
    let subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (subscriber) {
      return res.status(400).json({ message: 'Email is already subscribed' });
    }

    subscriber = new Subscriber({
      email: email.toLowerCase()
    });

    await subscriber.save();

    // Send the welcome email
    await sendSubscriptionEmail(subscriber.email);

    res.status(201).json({ message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    console.error('❌ Error subscribing:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/subscribers
// @desc    Get all subscribers (Admin only)
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (error) {
    console.error('❌ Error fetching subscribers:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
