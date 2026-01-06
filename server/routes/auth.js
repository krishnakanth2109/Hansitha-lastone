const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth.js");
const User = require("../models/User.model.js");
const Order = require("../models/Order");
const router = express.Router();
// Add this line at the top with your other imports
const { OAuth2Client } = require('google-auth-library');

// ... your existing imports like express, bcrypt, jwt, etc.

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Add this line after `router`
/* ------------------- Admin Related ------------------- */
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("name email");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.patch("/update-role", async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ message: "Email and role are required" });

  try {
    const user = await User.findOneAndUpdate({ email }, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Role updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ------------------- Auth ------------------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    // Send the full user object back, which will now include the avatar
    res.json({ success: true, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    // This .select("-password") automatically includes the new 'avatar' field. It is correct.
    const user = await User.findById(req.user.id)
      .populate("wishlist")
      .populate("cart.product")
      .select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

/* ------------------- Cart Routes ------------------- */
router.get("/cart", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Server error fetching cart" });
  }
});

router.post("/cart", auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const index = user.cart.findIndex((item) => item.product.toString() === productId);
    if (index !== -1) user.cart[index].quantity += quantity;
    else user.cart.push({ product: productId, quantity });
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate("cart.product");
    res.json({ success: true, cart: updatedUser.cart });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

router.put("/cart", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const index = user.cart.findIndex((item) => item.product.toString() === productId);
    if (index !== -1) {
      if (quantity <= 0) user.cart.splice(index, 1);
      else user.cart[index].quantity = quantity;
      await user.save();
      const updatedUser = await User.findById(req.user.id).populate("cart.product");
      res.json({ success: true, cart: updatedUser.cart });
    } else res.status(404).json({ message: "Item not found in cart" });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

router.delete("/cart/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate("cart.product");
    res.json({ success: true, cart: updatedUser.cart });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ message: "Failed to remove from cart" });
  }
});

router.delete("/cart", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.cart = [];
    await user.save();
    res.json({ success: true, cart: [] });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

/* ------------------- Wishlist Routes ------------------- */
router.post("/wishlist", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "Product ID is required" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const exists = user.wishlist.some((id) => id.toString() === productId);
    if (exists) user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    else user.wishlist.push(productId);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist, action: exists ? "removed" : "added" });
  } catch (err) {
    console.error("Wishlist toggle error:", err);
    res.status(500).json({ message: "Server error updating wishlist" });
  }
});

router.get("/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ message: "Server error fetching wishlist" });
  }
});

router.delete("/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.wishlist = [];
    await user.save();
    res.json({ success: true, wishlist: [] });
  } catch (err) {
    console.error("Clear wishlist error:", err);
    res.status(500).json({ message: "Failed to clear wishlist" });
  }
});

/* ------------------- Orders & Account ------------------- */
router.patch("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete-account", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("token");
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting account", error: err.message });
  }
});

/* ------------------- Address Routes ------------------- */
router.get("/addresses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.addresses);
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ message: "Server error fetching addresses" });
  }
});
/* ------------------- Auth ------------------- */

// ✅ START: ADD THIS NEW CODE BLOCK

// --- REGISTRATION ---
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        user = new User({ name, email, password, provider: 'local' });
        await user.save();
        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ message: "Server error during registration" });
    }
});


// --- GOOGLE LOGIN ---
router.post('/google-login', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (!user) {
            // If user doesn't exist, create a new one for them
            user = new User({
                name: name,
                email: email,
                avatar: picture,
                provider: 'google', // Mark as a Google user (no password)
            });
            await user.save();
        }

        // Create a session token and log them in
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', jwtToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ success: true, user });

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(400).json({ message: 'Google authentication failed' });
    }
});

// ✅ END: ADD THIS NEW CODE BLOCK

// Your existing /login route starts here...

router.post("/addresses", auth, async (req, res) => {
  try {
    const newAddress = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    console.error("Add address error:", error);
    if (error.name === 'ValidationError') return res.status(400).json({ message: "Validation error", details: error.message });
    res.status(500).json({ message: "Server error adding address" });
  }
});

router.delete("/addresses/:addressId", auth, async (req, res) => {
  try {
    const { addressId } = req.params;
    await User.findByIdAndUpdate(req.user.id, { $pull: { addresses: { _id: addressId } } });
    const updatedUser = await User.findById(req.user.id);
    res.status(200).json(updatedUser.addresses);
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Server error deleting address" });
  }
});

router.put("/addresses/:addressId", auth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });
    address.set(req.body);
    await user.save();
    res.status(200).json(user.addresses);
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Server error updating address" });
  }
});

// ✅ START: NEW AVATAR UPDATE ROUTE
router.put("/avatar", auth, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      return res.status(400).json({ message: "Avatar URL is required" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, message: "Avatar updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Avatar update error:", error);
    res.status(500).json({ message: "Server error updating avatar" });
  }
});
// Add this block to the end of your server/routes/auth.js file, before `module.exports = router;`

// --- 5. LOGOUT ---
router.post('/logout', (req, res) => {
    // This is the most important step. It tells the browser to delete the cookie.
    // The options (secure, sameSite) MUST match the options used when setting the cookie in /login.
    res.clearCookie('token', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "None" 
    });
    
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});
// ✅ END: NEW AVATAR UPDATE ROUTE

module.exports = router;