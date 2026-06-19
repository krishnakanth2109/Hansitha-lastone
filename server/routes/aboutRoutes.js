// server/routes/aboutRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const About = require('../models/About');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    let aboutData = await About.findOne();
    if (!aboutData) {
      aboutData = await About.create({});
    }
    res.json(aboutData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch about data" });
  }
});

router.post('/upload', upload.fields([
  { name: 'founderImage1', maxCount: 1 },
  { name: 'founderImage2', maxCount: 1 },
  { name: 'founderImage3', maxCount: 1 }
]), async (req, res) => {
  try {
    let aboutData = await About.findOne();
    if (!aboutData) aboutData = new About();

    const uploadToCloudinary = async (file) => {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64, {
        folder: "founder_images",
      });
      return result.secure_url;
    };

    if (req.files?.founderImage1?.[0]) {
      aboutData.founderImage1 = await uploadToCloudinary(req.files.founderImage1[0]);
    }
    if (req.files?.founderImage2?.[0]) {
      aboutData.founderImage2 = await uploadToCloudinary(req.files.founderImage2[0]);
    }
    if (req.files?.founderImage3?.[0]) {
      aboutData.founderImage3 = await uploadToCloudinary(req.files.founderImage3[0]);
    }

    await aboutData.save();
    res.json({ success: true, data: aboutData });
  } catch (error) {
    console.error("About Upload Error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;