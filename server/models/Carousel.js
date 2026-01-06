const mongoose = require('mongoose');

const CarouselSchema = new mongoose.Schema({
  carouselId: { type: String, required: true, unique: true },
  imageUrl: { type: String },          // Desktop image
  mobileImageUrl: { type: String },    // Mobile image
});

module.exports = mongoose.model('Carousel', CarouselSchema);
