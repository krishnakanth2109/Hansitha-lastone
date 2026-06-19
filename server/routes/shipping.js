
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const { trackShipmentByAwb } = require('../services/shiprocketService');

// GET tracking details for a specific AWB
router.get('/track/:awb', auth, async (req, res) => {
    const { awb } = req.params;
    if (!awb) {
        return res.status(400).json({ message: 'AWB code is required.' });
    }
    try {
        const trackingData = await trackShipmentByAwb(awb);
        res.json(trackingData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;