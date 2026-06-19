import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { ProductContext } from "@/context/ProductContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toastWithVoice } from "@/utils/toast";
import { ShoppingBag, Trash2 } from "lucide-react"; // Imported icons for buttons

const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { products, loading: productsLoading } = useContext(ProductContext);
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { addToCart } = useCart(); // Access cart actions
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toastWithVoice.error("Please login to view your wishlist", {
        id: "wishlist-login",
      });
      navigate("/login");
    }
  }, [user, navigate]);

  // Filter products based on wishlist
  useEffect(() => {
    setLoading(true);
    try {
      if (Array.isArray(products)) {
        const filtered = products.filter((p) => wishlist.includes(p._id));
        setWishlistProducts(filtered);
      } else {
        setWishlistProducts([]);
      }
    } catch (err) {
      console.error("Failed to filter wishlist:", err);
      toastWithVoice.error("Could not load wishlist");
    } finally {
      setLoading(false);
    }
  }, [products, wishlist]);

  // Fallback timeout in case something goes wrong
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("⏱️ Timeout forcing loading = false");
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [loading]);

  // --- Handlers ---
  const handleMoveToCart = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toastWithVoice.error("This item is currently out of stock.");
      return;
    }

    // Add to cart
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    // Remove from wishlist
    await toggleWishlist(product._id);
    toastWithVoice.success("Moved to cart!");
  };

  const handleRemoveFromWishlist = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    await toggleWishlist(product._id);
    toastWithVoice.success("Removed from wishlist");
  };

  if (!user) return null;

  if (loading || productsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#9B59B6" }}></div>
      </div>
    );
  }

  if (wishlist.length === 0 || wishlistProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col">
        <HeartIconEmpty className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl font-bold text-white-800 mb-2">Your wishlist is empty</p>
        <p className="text-sm text-green-500 mb-6">Save items you love to shop them later.</p>
        <button
          onClick={() => navigate("/shop")}
          className="px-8 py-3 text-white font-bold rounded-lg transition-colors shadow-md"
          style={{ background: "linear-gradient(to right, #5B6CF9, #9B59B6, #E91E8C)" }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F2F2F4" }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Wishlist <span className="text-lg font-normal text-gray-500">({wishlistProducts.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {wishlistProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product._id}
                onClick={() =>
                  navigate(`/product/${encodeURIComponent(product.name)}`, {
                    state: { product },
                  })
                }
                className="cursor-pointer group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isOutOfStock ? "grayscale opacity-60" : ""
                    }`}
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                      <span className="bg-black text-white px-3 py-1.5 text-[10px] font-black tracking-widest rounded-full shadow-lg">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 md:p-4 flex flex-col flex-grow">
                  <h3 className="text-gray-800 font-semibold text-sm leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <div className="mt-1 mb-4">
                    <span className="text-lg font-black" style={{ background: "linear-gradient(to right, #5B6CF9, #E91E8C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {/* Actions (Move to Cart & Remove) */}
                  <div className="mt-auto space-y-2">
                    <button
                      onClick={(e) => handleMoveToCart(e, product)}
                      disabled={isOutOfStock}
                      className={`w-full py-2.5 rounded-md text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isOutOfStock 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                        : "text-white shadow-md"
                      }`}
                      style={!isOutOfStock ? { background: "linear-gradient(to right, #5B6CF9, #9B59B6, #E91E8C)" } : {}}
                    >
                      <ShoppingBag size={14} />
                      {isOutOfStock ? "Out of Stock" : "Move to Cart"}
                    </button>
                    
                    <button
                      onClick={(e) => handleRemoveFromWishlist(e, product)}
                      className="w-full py-2.5 rounded-md text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-100"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper icon for empty state
const HeartIconEmpty = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export default WishlistPage;