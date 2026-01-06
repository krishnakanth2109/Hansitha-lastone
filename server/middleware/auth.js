// server/middleware/auth.js (Complete, Corrected Code)

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // 1. Read the token from the httpOnly cookie.
  // Your login route (routes/auth.js) correctly names this cookie "token".
  const token = req.cookies.token;

  if (!token) {
    // If no cookie is present, the user is not authenticated.
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    // 2. Verify the token is valid.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach the user's ID to the request object for use in protected routes.
    req.user = { id: decoded.id };
    
    next();
  } catch (err) {
    // If the token is invalid (expired, tampered), deny access.
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

module.exports = authMiddleware;