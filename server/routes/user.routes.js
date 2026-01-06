const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth.js");
const User = require("../models/User.model.js");
// Add at the top with other imports
const Order = require("../models/Order");
const router = express.Router();

/* ------------------- Admin Related ------------------- */

// ✅ Get all admin users
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("name email");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Update user role
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

// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      userId: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ✅ Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("wishlist")
      .populate("cart.product")
      .select("name email role cart wishlist orders");

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

/* ------------------- Cart Routes ------------------- */

// ✅ Get Cart
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

// ✅ Add to Cart
router.post("/cart", auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.cart.findIndex((item) => item.product.toString() === productId);
    if (index !== -1) {
      user.cart[index].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate("cart.product");
    res.json({ success: true, cart: updatedUser.cart });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

// ✅ Update Cart Item Quantity
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
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

// ✅ Remove from Cart
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

// ✅ Clear Cart
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

// ✅ Toggle Wishlist
router.post("/wishlist", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "Product ID is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.wishlist.some((id) => id.toString() === productId);
    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({
      success: true,
      wishlist: user.wishlist,
      action: exists ? "removed" : "added",
    });
  } catch (err) {
    console.error("Wishlist toggle error:", err);
    res.status(500).json({ message: "Server error updating wishlist" });
  }
});

// ✅ Get Wishlist
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

// ✅ Clear Wishlist
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

// ✅ Place Order
router.post("/order", auth, async (req, res) => {
  try {
    const { products, total } = req.body;
    if (!products || typeof total !== "number")
      return res.status(400).json({ message: "Missing products or total" });

    const user = await User.findById(req.user.id);
    user.orders.push({ products, total });
    await user.save();

    res.json(user.orders);
  } catch (err) {
    console.error("Place order error:", err);
    res.status(500).json({ message: "Error placing order", error: err.message });
  }
});

// ✅ Change Password
router.patch("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    user.password = newPassword; // Will trigger pre-save hash
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete Account
router.delete("/delete-account", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("token");
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting account", error: err.message });
  }
});

// ✅ PUT (update) an existing address
// ✅ PUT (update) an existing address
/* ------------------- Address Routes ------------------- */

// ✅ GET all addresses for the current user
router.get("/addresses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.addresses);
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ message: "Server error fetching addresses" });
  }
});


// ✅ POST (add) a new address for the current user
router.post("/addresses", auth, async (req, res) => {
  try {
    const newAddress = req.body; 

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.push(newAddress);
    await user.save();
    
    res.status(201).json(user.addresses);
  } catch (error) {
    console.error("Add address error:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: "Validation error", details: error.message });
    }
    res.status(500).json({ message: "Server error adding address" });
  }
});


// ✅ DELETE an address by its ID for the current user
router.delete("/addresses/:addressId", auth, async (req, res) => {
    try {
        const { addressId } = req.params;

        // The .pull() method is the correct way to remove a subdocument from an array
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { addresses: { _id: addressId } }
        });

        // Fetch the user again to get the updated list of addresses
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
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }
        
        // This line finds the specific address and updates its fields with the new data
        address.set(req.body);
        
        // Save the entire user document with the updated address
        await user.save();
        
        // Return the full, updated list of addresses
        res.status(200).json(user.addresses);
    } catch (error) {
        console.error("Update address error:", error);
        res.status(500).json({ message: "Server error updating address" });
    }
});
// NEW ROUTE: Get all orders for the currently logged-in user
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch user orders' });
  }
});
router.post("/cart/sync", auth, async (req, res) => {
  try {
    const { cart } = req.body; // Expect an array of cart items

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Transform the incoming cart to match the schema structure
    const formattedCart = cart.map(item => ({
      product: item.id,
      quantity: item.quantity,
    }));
    
    user.cart = formattedCart;
    await user.save();
    
    const updatedUser = await User.findById(req.user.id).populate("cart.product");
    res.json({ success: true, cart: updatedUser.cart });

  } catch (err) {
    console.error("Sync cart error:", err);
    res.status(500).json({ message: "Failed to sync cart" });
  }
});
module.exports = router;
