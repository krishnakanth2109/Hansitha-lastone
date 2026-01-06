const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1. DEFINE THE ADDRESS SCHEMA FIRST
const AddressSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    houseNumber: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
});


// 2. DEFINE THE MAIN USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    // ✅ ADDED AVATAR FIELD
    avatar: {
      type: String,
      default: '', // Default to an empty string
    },
    password: { 
      type: String, 
      required: false 
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    addresses: [AddressSchema],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  }
);


// 3. MIDDLEWARE & METHODS

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('remove', async function(next) {
    try {
        await this.model('Order').deleteMany({ user: this._id });
        next();
    } catch (err) {
        next(err);
    }
});


// 4. EXPORT THE MODEL
module.exports = mongoose.model("User", userSchema);