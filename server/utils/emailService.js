const nodemailer = require("nodemailer");

// Create the transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

const SENDER_NAME = `"Hansitha Creations" <${process.env.SMTP_EMAIL}>`;

/**
 * Send Subscription Confirmation Email
 */
const sendSubscriptionEmail = async (email) => {
  try {
    const mailOptions = {
      from: SENDER_NAME,
      to: email,
      subject: "Welcome to Hansitha Creations Newsletter! 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #d81b60; text-align: center;">Welcome to Hansitha Creations!</h2>
          <p>Hi there,</p>
          <p>Thank you for subscribing to our newsletter! You'll be the first to know about our latest collections, exclusive discounts, and fashion tips.</p>
          <p>Stay tuned for exciting updates!</p>
          <p style="margin-top: 30px;">Best regards,<br/><strong>The Hansitha Creations Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Subscription email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending subscription email:", error);
  }
};

/**
 * Send Order Confirmation Email
 */
const sendOrderConfirmationEmail = async (email, order) => {
  try {
    const mailOptions = {
      from: SENDER_NAME,
      to: email,
      subject: `Order Confirmation - Order #${order._id.toString().slice(-6)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #d81b60; text-align: center;">Order Confirmed!</h2>
          <p>Hi ${order.shippingAddress?.fullName || 'Valued Customer'},</p>
          <p>Thank you for shopping with us! We have received your order and it is now being processed.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Summary</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          <h4>Items Ordered:</h4>
          <ul>
            ${order.orderItems.map(item => `
              <li>${item.name} - Qty: ${item.qty} - ₹${item.price}</li>
            `).join('')}
          </ul>

          <p>We will notify you once your order has been shipped!</p>
          <p style="margin-top: 30px;">Best regards,<br/><strong>The Hansitha Creations Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending order confirmation email:", error);
  }
};

/**
 * Send New Product Email to Subscribers
 */
const sendNewProductEmail = async (emails, product) => {
  try {
    const mailOptions = {
      from: SENDER_NAME,
      to: process.env.SMTP_EMAIL, // Send to self
      bcc: emails, // Use BCC to hide subscriber emails from each other
      subject: `New Arrival: ${product.name}! ✨`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #d81b60; text-align: center;">New Product Alert!</h2>
          <p>Hi there,</p>
          <p>We just added a beautiful new product to our store that we thought you might love!</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="${product.image}" alt="${product.name}" style="max-width: 100%; height: auto; border-radius: 8px;" />
            <h3 style="margin: 10px 0;">${product.name}</h3>
            <p style="font-size: 18px; color: #333;"><strong>₹${product.price}</strong></p>
            <p style="color: #666;">${product.description || ''}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/product/${product._id}" 
               style="background-color: #d81b60; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">
              Shop Now
            </a>
          </div>
          
          <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">
            You are receiving this email because you subscribed to our newsletter.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ New product email sent to ${emails.length} subscribers`);
  } catch (error) {
    console.error("❌ Error sending new product email:", error);
  }
};

/**
 * Send Order Status Update Email
 */
const sendOrderStatusEmail = async (email, order) => {
  try {
    let customMessage = `Your order status has been updated to: <strong>${order.status}</strong>.`;
    
    if (order.status === 'Shipped') {
      customMessage = `Great news! Your order has been shipped.`;
      if (order.trackingDetails?.awbCode) {
        customMessage += `<br/><strong>Courier:</strong> ${order.trackingDetails.courierName || 'N/A'}<br/><strong>Tracking AWB:</strong> ${order.trackingDetails.awbCode}`;
      }
    } else if (order.status === 'Delivered') {
      customMessage = `Your order has been delivered! We hope you love your new purchase from Hansitha Creations.`;
    } else if (order.status === 'Cancelled') {
      customMessage = `Your order has been cancelled. If you have any questions, please contact our support.`;
    }

    const mailOptions = {
      from: SENDER_NAME,
      to: email,
      subject: `Order Update - Order #${order._id.toString().slice(-6)} is now ${order.status}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #d81b60; text-align: center;">Order Status Update</h2>
          <p>Hi ${order.shippingAddress?.fullName || 'Valued Customer'},</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 16px;">
            <p>${customMessage}</p>
          </div>
          
          <div style="margin-top: 20px;">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
          </div>

          <p style="margin-top: 30px;">Best regards,<br/><strong>The Hansitha Creations Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order status email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending order status email:", error);
  }
};

module.exports = {
  sendSubscriptionEmail,
  sendOrderConfirmationEmail,
  sendNewProductEmail,
  sendOrderStatusEmail
};
