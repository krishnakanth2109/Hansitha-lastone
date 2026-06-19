// scripts/fix-pending-orders.js
// Run this script ONCE to fix existing pending orders

const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function fixPendingOrders() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "web-store",
    });
    console.log('✅ Connected to MongoDB');

    // Find all orders that are stuck in pending payment status
    const pendingOrders = await Order.find({ 
      paymentStatus: 'pending' 
    }).sort({ createdAt: -1 });

    console.log(`\n📊 Found ${pendingOrders.length} pending orders\n`);

    if (pendingOrders.length === 0) {
      console.log('✅ No pending orders to fix!');
      process.exit(0);
    }

    let fixed = 0;
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    for (const order of pendingOrders) {
      const age = Date.now() - order.createdAt.getTime();
      const hours = Math.floor(age / (1000 * 60 * 60));

      console.log(`\n📦 Order: ${order._id}`);
      console.log(`   Created: ${order.createdAt.toLocaleString()}`);
      console.log(`   Age: ${hours} hours`);
      console.log(`   Current Status: ${order.paymentStatus} / ${order.status}`);

      // If order is older than 24 hours and still pending, mark as failed
      if (order.createdAt < cutoffDate) {
        order.paymentStatus = 'failed';
        order.status = 'Cancelled';
        order.adminStatus = 'rejected';
        await order.save();
        
        console.log(`   ✅ Updated to: failed / Cancelled`);
        fixed++;
      } else {
        console.log(`   ⏳ Still within 24-hour window - keeping as pending`);
      }
    }

    console.log(`\n✅ Fixed ${fixed} out of ${pendingOrders.length} orders`);
    console.log(`⏳ Kept ${pendingOrders.length - fixed} recent orders as pending\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
}

// Run the script
fixPendingOrders();