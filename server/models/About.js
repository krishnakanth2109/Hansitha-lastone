// server/models/About.js
const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  founderImage1: { type: String, default: "" }, // Main Image
  founderImage2: { type: String, default: "" }, // Secondary Top
  founderImage3: { type: String, default: "" }  // Secondary Bottom
}, { timestamps: true });

module.exports = mongoose.model('About', AboutSchema);