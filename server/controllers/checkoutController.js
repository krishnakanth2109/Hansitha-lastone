const Order = require('../models/Order');

const saveCheckoutOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: 'Order saved successfully' });
  } catch (err) {
    console.error('Order Save Error:', err);
    res.status(500).json({ error: 'Failed to save order' });
  }
};

module.exports = { saveCheckoutOrder };
