import React, { useContext, useState } from "react";
import { ProductContext } from "../context/ProductContext";
import { useNavigate } from "react-router-dom";
import { Heart, Plus, Minus, ShoppingBag, Eye } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toastWithVoice } from "@/utils/toast";

const FeaturedProducts: React.FC = () => {
  const { products, loading } = useContext(ProductContext);
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const navigate = useNavigate();
  
  // State to track local quantity for each product card
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const featured = Array.isArray(products)
    ? products.filter((product) => product.featured)
    : [];

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.name}`, { state: { product } });
  };

  const updateQuantity = (id: string, delta: number, stock: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const newValue = Math.max(1, Math.min(current + delta, stock));
      return { ...prev, [id]: newValue };
    });
  };

  if (loading) return <p className="p-4 text-center">Loading featured products...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-2xl text-center text-brandPink font-bold mb-10 tracking-wider uppercase">
        FEATURED PRODUCTS
      </h2>

      {featured.length === 0 ? (
        <p className="text-center text-gray-500">No featured products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 gap-y-6">
          {featured.map((product) => {
            const isWishlisted = isInWishlist(product._id);
            const currentQty = quantities[product._id] || 1;
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product._id}
                className="group bg-white flex flex-col h-full rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                {/* Image Section */}
                <div
                  className="relative cursor-pointer overflow-hidden aspect-[3/4]"
                  onClick={() => handleProductClick(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    loading="lazy"
                  />

                  {/* NEW Badge */}
                  <div className="absolute top-2 left-2 bg-[#D03D56] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                    NEW
                  </div>

                  {/* Out of Stock Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <span className="text-gray-600 font-medium text-sm tracking-wide bg-white/80 px-4 py-1 rounded-full">
                        Out of stock
                      </span>
                    </div>
                  )}

                  {/* Floating Action Menu on Hover */}
                  {!isOutOfStock && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({ id: product._id, name: product.name, price: product.price, image: product.image, quantity: currentQty });
                          toastWithVoice.success("Added to cart");
                        }}
                        className="bg-white p-2.5 rounded shadow-lg text-gray-700 hover:text-black hover:scale-110 transition-transform"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!user) { toastWithVoice.error("Please log in to add to wishlist"); return; }
                          await toggleWishlist(product._id);
                        }}
                        className="bg-white p-2.5 rounded shadow-lg text-gray-700 hover:text-black hover:scale-110 transition-transform"
                        title="Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? "text-red-500 fill-red-500" : ""}`} />
                      </button>
                      <button
                        className="bg-white p-2.5 rounded shadow-lg text-gray-700 hover:text-black hover:scale-110 transition-transform hidden md:block"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="text-gray-800 font-medium text-sm leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <span className="text-[#c6893f] font-bold text-sm mb-3">
                    {formatPrice(product.price)}
                  </span>

                  <div className="mt-auto space-y-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between border border-gray-200 rounded-md">
                      <button
                        onClick={() => updateQuantity(product._id, -1, product.stock)}
                        disabled={isOutOfStock}
                        className="w-10 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                      </button>
                      <span className="font-bold text-gray-800 text-sm">{isOutOfStock ? 0 : currentQty}</span>
                      <button
                        onClick={() => updateQuantity(product._id, 1, product.stock)}
                        disabled={isOutOfStock}
                        className="w-10 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isOutOfStock) return;
                        addToCart({ id: product._id, name: product.name, price: product.price, image: product.image, quantity: currentQty });
                        toastWithVoice.success("Added to cart");
                      }}
                      disabled={isOutOfStock}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                        isOutOfStock
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "text-white active:scale-95"
                      }`}
                      style={!isOutOfStock ? { background: "linear-gradient(to right, #5B6CF9, #9B59B6, #E91E8C)" } : {}}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;