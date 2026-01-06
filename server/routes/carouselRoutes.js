const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
  uploadCarousel,
  getCarousels,
  deleteCarousel,
} = require('../controllers/carouselController');

router.post(
  '/upload-carousel',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 },
  ]),
  uploadCarousel
);

router.get('/carousel-images', getCarousels);

router.delete('/delete-carousel/:id', deleteCarousel);

module.exports = router;
