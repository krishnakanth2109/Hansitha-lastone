const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User.model"); // Ensure this path matches your file structure

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connect to Database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🔥 MongoDB Connected...");

    // 2. DELETE ALL USERS
    // This removes every user to ensure no conflicting data or old unhashed passwords exist.
    await User.deleteMany({});
    console.log("❌ All existing users have been deleted.");

    // 3. CREATE THE ADMIN USER
    // We pass the plain text password. The User.model.js pre('save') hook 
    // will detect it and hash it automatically before saving to DB.
    const adminUser = new User({
      name: "Hansitha Admin",
      email: "hansitha@gmail.com",
      password: "12345678", 
      role: "admin", // Sets the role to admin
      cart: [],
      wishlist: [],
      addresses: []
    });

    await adminUser.save();
    console.log("✅ Admin Created Successfully!");
    console.log("📧 Email: hansitha@gmail.com");
    console.log("🔑 Password: 12345678");

    process.exit();
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedAdmin();