// fix-current-order.js
// Script to manually update the current order to PAID status

const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User.model');
require('dotenv').config();

async function fixCurrentOrder() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "web-store",
    });
    console.log('✅ Connected to MongoDB\n');

    // The order ID from the screenshot
    const orderId = "6992320e7165c493ba2a56b0";
    
    console.log(`🔍 Looking for order: ${orderId}`);
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.log('❌ Order not found!');
      process.exit(1);
    }

    console.log('\n📊 BEFORE UPDATE:');
    console.log(`   Order ID: ${order._id}`);
    console.log(`   Payment Status: ${order.paymentStatus}`);
    console.log(`   Order Status: ${order.status}`);
    console.log(`   Admin Status: ${order.adminStatus}`);
    console.log(`   Total Amount: ₹${order.totalAmount}`);
    console.log(`   Customer: ${order.email}`);
    
    // Update the order
    console.log('\n🔄 Updating order...');
    
    order.paymentStatus = 'paid';
    order.status = 'Placed';
    order.adminStatus = 'pending';
    
    await order.save();
    
    console.log('\n📊 AFTER UPDATE:');
    console.log(`   Payment Status: ${order.paymentStatus}`);
    console.log(`   Order Status: ${order.status}`);
    console.log(`   Admin Status: ${order.adminStatus}`);
    
    // Clear user's cart
    if (order.user) {
      console.log(`\n🛒 Clearing cart for user: ${order.user}`);
      const user = await User.findByIdAndUpdate(
        order.user,
        { $set: { cart: [] } },
        { new: true }
      );
      
      if (user) {
        console.log(`✅ Cart cleared for: ${user.email}`);
      }
    }
    
    console.log('\n✅ Order updated successfully!');
    console.log('🎉 The order now shows as PAID in the admin dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the script
fixCurrentOrder();