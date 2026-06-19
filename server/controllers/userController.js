import User from "../models/User.js";

// Add to Cart
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const user = await User.findById(req.user._id);
  const existingIndex = user.cart.findIndex(item => item.product.toString() === productId);

  if (existingIndex !== -1) {
    user.cart[existingIndex].quantity = quantity || 1;
  } else {
    user.cart.push({ product: productId, quantity: quantity || 1 });
  }

  await user.save();
  res.status(200).json({ message: "Cart updated", cart: user.cart });
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter(item => item.product.toString() !== productId);

  await user.save();
  res.status(200).json({ message: "Removed from cart", cart: user.cart });
};

// Add/Remove Wishlist
export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user._id);
  const index = user.wishlist.indexOf(productId);

  if (index === -1) {
    user.wishlist.push(productId);
  } else {
    user.wishlist.splice(index, 1);
  }

  await user.save();
  res.status(200).json({ message: "Wishlist updated", wishlist: user.wishlist });
};

// Change Password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "All fields required" });

  const user = await User.findById(req.user._id);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
};

// Delete Account
export const deleteAccount = async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.clearCookie("token");
  res.status(200).json({ message: "Account deleted" });
};
