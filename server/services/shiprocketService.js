// server/services/shiprocketService.js (Complete, Enhanced Code)

const axios = require('axios');
let apiToken = null;
let tokenExpiry = null;

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

/**
 * Gets a valid API token, refreshing it if it's expired or doesn't exist.
 */
const getToken = async () => {
    if (apiToken && tokenExpiry && new Date() < tokenExpiry) {
        return apiToken;
    }

    try {
        console.log('Fetching new Shiprocket API token...');
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: process.env.SHIPROCKET_API_EMAIL,
            password: process.env.SHIPROCKET_API_PASSWORD,
        });

        if (response.data.token) {
            apiToken = response.data.token;
            tokenExpiry = new Date(new Date().getTime() + 9 * 24 * 60 * 60 * 1000);
            console.log('Successfully fetched new Shiprocket token.');
            return apiToken;
        }
    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error("Error fetching Shiprocket token:", errorMessage);
        throw new Error('Could not authenticate with Shiprocket.');
    }
};

/**
 * Creates an "Adhoc" (quick) order in Shiprocket.
 * @param {object} order - The order object from your database.
 */
const createShiprocketOrder = async (order) => {
    try {
        const token = await getToken();
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        const orderData = {
            order_id: order._id.toString(),
            order_date: new Date(order.createdAt).toISOString().slice(0, 10),
            pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
            billing_customer_name: order.address.name,
            billing_last_name: "", // Can be empty
            billing_address: `${order.address.houseNumber}, ${order.address.street}`,
            billing_address_2: order.address.landmark || "",
            billing_city: order.address.city,
            billing_pincode: order.address.pincode,
            billing_state: order.address.state, // Ensure 'state' is in your address object
            billing_country: "India",
            billing_email: order.email,
            billing_phone: order.address.phone, // Ensure 'phone' is in your address object
            shipping_is_billing: true,
            order_items: order.cartItems.map(item => ({
                name: item.name,
                sku: item.id || `SKU-${item._id}`,
                units: item.quantity,
                selling_price: item.price,
            })),
            payment_method: "Prepaid",
            sub_total: order.totalAmount,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5, // Weight in Kg
        };

        const response = await axios.post(`${BASE_URL}/orders/create/adhoc`, orderData, config);
        return response.data;

    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('Error creating Shiprocket order:', errorMessage);
        throw new Error('Failed to create order in Shiprocket.');
    }
};

/**
 * Assigns a courier and generates an AWB for a given shipment.
 * @param {string} shipmentId - The shipment_id from the order creation response.
 */
const assignCourierAndGetAwb = async (shipmentId) => {
    try {
        const token = await getToken();
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        const data = { shipment_id: shipmentId };

        const response = await axios.post(`${BASE_URL}/courier/assign/awb`, data, config);
        return response.data;

    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error(`Error assigning AWB for shipment ${shipmentId}:`, errorMessage);
        throw new Error('Failed to assign courier and get AWB from Shiprocket.');
    }
};

/**
 * Tracks a shipment using its Airway Bill (AWB) number.
 */
const trackShipmentByAwb = async (awbCode) => {
    try {
        const token = await getToken();
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        const response = await axios.get(`${BASE_URL}/courier/track/awb/${awbCode}`, config);
        return response.data;

    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error(`Error tracking AWB ${awbCode}:`, errorMessage);
        throw new Error('Failed to get tracking details from Shiprocket.');
    }
};

module.exports = {
    createShiprocketOrder,
    assignCourierAndGetAwb,
    trackShipmentByAwb,
};