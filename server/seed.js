const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./product.model'); // Make sure this file is named correctly

const MONGO_URI = process.env.MONGO_URI;

const seedProducts = async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connected to MongoDB');

  const products = [
    {
      name: 'Men’s Cotton T-Shirt',
      price: 799,
      image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      description: 'Soft and breathable cotton tee perfect for everyday wear.',
      featured: true,
    },
    {
      name: 'Women’s Slim Fit Jeans',
      price: 1499,
      image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      description: 'Stretchable denim jeans for a perfect fit.',
      featured: false,
    },
    {
      name: 'Wireless Headphones',
      price: 2299,
      image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      description: 'Bluetooth headphones with noise cancellation.',
      featured: true,
    },
  ];

  try {
    await Product.deleteMany({});
    console.log('Old products removed');

    await Product.insertMany(products);
    console.log('New products added');

    process.exit(); // Exit after done
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seedProducts();
