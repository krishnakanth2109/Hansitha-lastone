// server/routes/geocodeRoutes.js (NEW FILE)

const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth'); // Secure the endpoint

const API_KEY = 'pk.363895ea915f09ad4c96c3489c973773';
const BASE_URL = 'https://us1.locationiq.com/v1/reverse.php';

router.post('/reverse', auth, async (req, res) => {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }

    try {
        const response = await axios.get(BASE_URL, {
            params: {
                key: API_KEY,
                lat: lat,
                lon: lng,
                format: 'json',
            }
        });

        const address = response.data.address;

        if (!address) {
            return res.status(404).json({ error: 'Could not determine address from coordinates.' });
        }

        // Map the response to your address schema
        const formattedAddress = {
            houseNumber: address.house_number || '',
            street: address.road || '',
            area: address.suburb || address.village || '',
            city: address.city || address.town || '',
            state: address.state || '',
            pincode: address.postcode || '',
            // You can add more fields if needed, like country
        };

        res.json(formattedAddress);

    } catch (error) {
        console.error('Reverse geocoding error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to perform reverse geocoding.' });
    }
});

module.exports = router;