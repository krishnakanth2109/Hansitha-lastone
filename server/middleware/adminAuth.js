const User = require('../models/User.model.js');

const adminAuth = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error during admin authentication' });
    }
};

module.exports = adminAuth;