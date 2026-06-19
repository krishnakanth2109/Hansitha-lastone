const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/User.model");

// ✅ Transporter config (make sure .env has correct values)
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
    },
});

// In-memory OTP store (you may replace with DB/Redis)
const otpStore = new Map();

// ✅ Send OTP route
router.post("/request-otp", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000;

        otpStore.set(email, { otp, expires });

        await transporter.sendMail({
            from: `"Hansitha Creations" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "🔐 Your OTP for Password Reset",
            html: `
    <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 40px 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://res.cloudinary.com/djyredhur/image/upload/v1751127717/logo_ktewtc.png" alt="Hansitha Creations Logo" style="max-width: 200px;">
        </div>
        <h2 style="color: #333333;">OTP Verification</h2>
        <p style="font-size: 16px; color: #555555;">
          Hello ${user.name} ,<br><br>
          You recently requested to reset your password. Please use the OTP below to continue:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #007BFF; color: #ffffff; padding: 12px 24px; font-size: 24px; font-weight: bold; border-radius: 6px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #999999;">
          This OTP is valid for <strong>10 minutes</strong>. If you didn’t request a password reset, you can contact the support team immediately.
        </p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
        <p style="font-size: 12px; color: #cccccc; text-align: center;">
          &copy; ${new Date().getFullYear()} Hansitha Creations. All rights reserved.
        </p>
      </div>
    </div>
  `,
        });

        console.log("✅ OTP sent to:", email);
        res.json({ message: "OTP sent to email" });
    } catch (err) {
        console.error("❌ OTP Send Error:", err.message);
        res.status(500).json({ message: "Internal Server Error: Failed to send OTP" });
    }
});

// ✅ Verify OTP & Reset Password
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        if (!email || !otp || !password)
            return res.status(400).json({ message: "Missing fields" });

        const record = otpStore.get(email);

        if (!record || record.otp !== otp || Date.now() > record.expires) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        user.password = password; // Pre-save hook should hash it
        await user.save();

        otpStore.delete(email);
        console.log("✅ Password reset for", email);
        res.json({ message: "Password reset successful" });
    } catch (err) {
        console.error("❌ Password Reset Error:", err.message);
        res.status(500).json({ message: "Failed to reset password" });
    }
});

// ⏱️ Cleanup expired OTPs every 5 min
setInterval(() => {
    const now = Date.now();
    for (const [email, record] of otpStore.entries()) {
        if (record.expires < now) {
            otpStore.delete(email);
            console.log(`🧹 Cleaned expired OTP for: ${email}`);
        }
    }
}, 5 * 60 * 1000);

module.exports = router;
