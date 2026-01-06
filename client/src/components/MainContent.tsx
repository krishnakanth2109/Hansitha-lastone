
import { useState } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import ProductDetails from '../pages/ProductDetailsPage';
import { useToast } from '@/hooks/use-toast';

const MainContent = () => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();

  const featuredProducts = [
    {
      id: 1,
      name: 'Premium Cotton Shirt',
      price: 899,
      originalPrice: 1299,
      category: 'Cotton',
      description: 'Made from 100% premium cotton, this shirt offers exceptional comfort and durability. Perfect for both casual and formal occasions. Features include breathable fabric, wrinkle-resistant finish, and classic fit that suits all body types.',
      rating: 4.5,
      reviews: 128,
      discount: 31,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop'
      ]
    },
    {
      id: 2,
      name: 'Silk Designer Dress',
      price: 2499,
      originalPrice: 3999,
      category: 'Silk',
      description: 'Elegant silk dress crafted with premium quality silk fabric. Features intricate embroidery work and a contemporary design that makes you stand out. Perfect for special occasions and formal events.',
      rating: 4.8,
      reviews: 89,
      discount: 38,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1566479179817-c619dbb0e1ba?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop'
      ]
    },
    {
      id: 3,
      name: 'Printed Casual Wear',
      price: 699,
      originalPrice: 999,
      category: 'Printed',
      description: 'Trendy printed casual wear that combines style and comfort. Made with soft, breathable fabric and featuring vibrant prints that add a pop of color to your wardrobe. Perfect for everyday wear.',
      rating: 4.3,
      reviews: 156,
      discount: 30,
      images: [
        'https://images.unsplash.com/photo-1503341338985-b019e0bbe338?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1496117681032-e3fd03d37c44?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop'
      ]
    },
    {
      id: 4,
      name: 'Festive Collection',
      price: 1899,
      originalPrice: 2799,
      category: 'Festive',
      description: 'Stunning festive wear designed for celebrations and special occasions. Features traditional craftsmanship with modern aesthetics, premium fabrics, and intricate detailing that makes every moment memorable.',
      rating: 4.7,
      reviews: 234,
      discount: 32,
      images: [
        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=500&h=500&fit=crop'
      ]
    }
  ];

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (productId: number, quantity: number) => {
    const product = featuredProducts.find(p => p.id === productId);
    if (product) {
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} added successfully!`,
      });
    }
  };

  if (selectedProduct) {
    return (
      <ProductDetails />
    );
  }

  return (
    <main className="pb-20 pt-4">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white py-12 px-4 mx-4 rounded-2xl mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
            Welcome to StyleHub
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            Discover the latest fashion trends
          </p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105">
            Shop Now
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Cotton', 'Silk', 'Printed', 'Designer', 'Festive'].map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">{category[0]}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{category}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 overflow-hidden cursor-pointer"
            >
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {product.discount}% OFF
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle wishlist functionality
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
                >
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-400">({product.reviews})</span>
                </div>
                
                {/* Price */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                  <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                </div>
                
                {/* Add to Cart Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product.id, 1);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-4 mb-8">
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-6">Subscribe to get special offers and updates</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MainContent;
