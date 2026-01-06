import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { ProductContext } from "@/context/ProductContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { toastWithVoice } from "@/utils/toast";

const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { products, loading: productsLoading } = useContext(ProductContext);
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
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

  if (!user) return null;

  if (loading || productsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-center py-10 text-lg">Loading wishlist...</p>
      </div>
    );
  }

  if (wishlist.length === 0 || wishlistProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col">
        <p className="text-lg text-gray-500 mb-4">Your wishlist is empty 💔</p>
        <button
          onClick={() => navigate("/shop")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
   <div className="bg-background text-foreground min-h-screen">
  <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
      <h2 className="text-2xl font-bold mb-6 text-center text-brandPink">
        Your Wishlist
      </h2></div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
        {wishlistProducts.map((product) => (
          <div
            key={product._id}
            onClick={() =>
              navigate(`/product/${encodeURIComponent(product.name)}`, {
                state: { product },
              })
            }
            className="cursor-pointer group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[280px] object-cover rounded  transform transition-transform duration-300 group-hover:scale-105"
              />
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await toggleWishlist(product._id);
                  toastWithVoice.success("Removed from wishlist");
                }}
                className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow-md transition-transform duration-150 active:scale-125 hover:bg-red-50"
                title="Remove from wishlist"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500 fill-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="p-3">
              <h3 className="text-base font-medium truncate">{product.name}</h3>
              <div className="mt-2 flex justify-center">
                <span className="text-lg font-semibold text-black">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="mt-3 flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${encodeURIComponent(product.name)}`, {
                      state: { product },
                    });
                  }}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
