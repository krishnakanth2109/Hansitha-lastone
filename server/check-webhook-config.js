// check-webhook-config.js
// Script to verify webhook configuration

require('dotenv').config();

console.log('='.repeat(60));
console.log('🔍 WEBHOOK CONFIGURATION CHECK');
console.log('='.repeat(60));

console.log('\n📋 Environment Variables:');
console.log(`   RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`   RAZORPAY_WEBHOOK_SECRET: ${process.env.RAZORPAY_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || '❌ Missing'}`);

if (process.env.RAZORPAY_WEBHOOK_SECRET) {
  console.log(`\n🔐 Webhook Secret Details:`);
  console.log(`   Length: ${process.env.RAZORPAY_WEBHOOK_SECRET.length} characters`);
  console.log(`   Starts with: ${process.env.RAZORPAY_WEBHOOK_SECRET.substring(0, 10)}...`);
  console.log(`   Format: ${process.env.RAZORPAY_WEBHOOK_SECRET.startsWith('whsec_') ? '✅ Correct (whsec_)' : '⚠️ Should start with whsec_'}`);
} else {
  console.log('\n❌ CRITICAL: RAZORPAY_WEBHOOK_SECRET is not set!');
  console.log('   This is why webhooks are not updating orders.');
  console.log('   Add it to your .env file:');
  console.log('   RAZORPAY_WEBHOOK_SECRET=whsec_your_secret_here');
}

console.log('\n' + '='.repeat(60));
console.log('💡 Next Steps:');
console.log('='.repeat(60));

if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
  console.log('1. Go to Razorpay Dashboard → Webhooks');
  console.log('2. Copy the webhook secret');
  console.log('3. Add to .env: RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx');
  console.log('4. Restart your server');
} else {
  console.log('✅ All environment variables are set');
  console.log('✅ Check your server logs when payment is made');
  console.log('   You should see: 🔨 [Webhook] NEW WEBHOOK REQUEST');
}

console.log('='.repeat(60) + '\n');