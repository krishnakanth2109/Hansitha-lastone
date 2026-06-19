const cloudinary = require('../utils/cloudinary');
const Carousel = require('../models/Carousel');
const fs = require('fs');

exports.uploadCarousel = async (req, res) => {
  try {
    const { carouselId } = req.body;
    const files = req.files;

    let imageUrl = '';
    let mobileImageUrl = '';

    // Upload desktop image
    if (files?.image?.[0]) {
      const result = await cloudinary.uploader.upload(files.image[0].path, {
        folder: 'carousel',
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(files.image[0].path); // remove temp file
    }

    // Upload mobile image
    if (files?.mobileImage?.[0]) {
      const result = await cloudinary.uploader.upload(files.mobileImage[0].path, {
        folder: 'carousel/mobile',
      });
      mobileImageUrl = result.secure_url;
      fs.unlinkSync(files.mobileImage[0].path); // remove temp file
    }

    const update = {};
    if (imageUrl) update.imageUrl = imageUrl;
    if (mobileImageUrl) update.mobileImageUrl = mobileImageUrl;

    const updated = await Carousel.findOneAndUpdate(
      { carouselId },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

exports.getCarousels = async (req, res) => {
  try {
    const carousels = await Carousel.find({});
    res.status(200).json(carousels);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed' });
  }
};

exports.deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    await Carousel.deleteOne({ carouselId: id });
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};
