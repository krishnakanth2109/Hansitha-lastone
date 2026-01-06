import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const query = new URLSearchParams(location.search).get('q') ?? '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products/search?q=${query}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Search fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    if (query.trim()) {
      fetchSearchResults();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.name}`, { state: { product } });
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-blue-400 to-pink-400">
      <h1 className="text-2xl font-bold mb-4">
        Search results for: <span className="text-purple-600">"{query}"</span>
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-center text-red-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {results.map((product) => {
            const isLowStock = product.stock <= 5 && product.stock > 0;
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product._id}
                onClick={() => handleProductClick(product)}
                className="bg-white border rounded-xl shadow hover:shadow-md transition p-4 flex flex-col cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-auto object-cover rounded mb-3"
                />
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating ?? 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2">({product.reviews ?? 0})</span>
                  </div>
                  <span
                    className={`font-medium ${
                      isLowStock ? 'text-orange-500' : 'text-gray-600'
                    }`}
                  >
                    Stock: {product.stock}
                  </span>
                </div>
                {isLowStock && (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mb-2 w-max">
                    Low Stock
                  </span>
                )}
                {isOutOfStock && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded mb-2 w-max">
                    Out of Stock
                  </span>
                )}
                <p className="text-blue-600 font-bold text-xl mb-4">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (isOutOfStock) return;
                    await addToCart({
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      quantity: 1,
                    });
                    toast.success(`${product.name} added to cart!`);
                  }}
                  disabled={isOutOfStock}
                  className={`mt-auto px-4 py-2 rounded-full font-semibold transition duration-200 ease-in-out ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
