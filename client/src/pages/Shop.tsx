import React, { useContext, useEffect, useState } from "react";
import { ProductContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { X, Heart, HeartIcon } from "lucide-react";
import clsx from "clsx";
import { useCurrency } from "@/context/CurrencyContext";
import { Footer } from "../components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { toastWithVoice } from "@/utils/toast";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const Shop: React.FC = () => {
  const { products, loading } = useContext(ProductContext);
  const { addToCart, cartItems } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [showFilterMobile, setShowFilterMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) return <p className="p-4 text-center">Loading products...</p>;

  const productList = Array.isArray(products) ? products : [];

  const filtered = productList
    .filter((product) => {
      return (
        product.price >= minPrice &&
        product.price <= maxPrice &&
        (selectedCategory ? product.category === selectedCategory : true)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return a.price - b.price;
      if (sortOrder === "desc") return b.price - a.price;
      return 0;
    });

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.name}`, { state: { product } });
  };

  const uniqueCategories = [...new Set(productList.map((p) => p.category))];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-400 to-pink-400">
      <main className="p-4 flex-grow">
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h2 className="text-2xl font-bold">🛍️ Products</h2>
          <button
            onClick={() => setShowFilterMobile(true)}
            className="bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded shadow"
          >
            ☰ Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[20%_80%] gap-6 relative">
          <aside
            className={clsx(
              "bg-white w-full lg:w-auto p-6 overflow-y-auto transition-transform duration-300 ease-in-out shadow-lg",
              {
                "fixed inset-0 transform translate-x-0 z-40":
                  showFilterMobile && isMobile,
                "fixed inset-0 transform -translate-x-full z-40":
                  !showFilterMobile && isMobile,
                "lg:sticky top-[100px] block": true,
              }
            )}
            style={{ maxHeight: "calc(100vh - 140px)" }}
          >
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilterMobile(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Category</h3>
                <div className="space-y-1">
                  {uniqueCategories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={() => {
                          setSelectedCategory(cat);
                          if (isMobile) setShowFilterMobile(false);
                        }}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === null}
                      onChange={() => {
                        setSelectedCategory(null);
                        if (isMobile) setShowFilterMobile(false);
                      }}
                    />
                    <span>All</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Price</h3>
                <div className="flex items-center gap-2">
                  ₹
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20"
                  />
                  to ₹
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sort By</h3>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc" | "")
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Default</option>
                  <option value="asc">Price: Low → High</option>
                  <option value="desc">Price: High → Low</option>
                </select>
              </div>
            </div>
          </aside>

          {isMobile && showFilterMobile && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
              onClick={() => setShowFilterMobile(false)}
            />
          )}

          <section className="lg:pl-0">
            <h2 className="text-2xl font-bold mb-4 hidden lg:block">
              🛍️ Products
            </h2>
            {filtered.length === 0 ? (
              <p>No products match your filters.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-5 gap-6">
                {filtered.map((product) => {
                  const cartQuantity =
                    cartItems.find((item) => item.id === product._id)?.quantity || 0;
                  const isOutOfStock = product.stock <= cartQuantity;
                  const isWishlisted = isInWishlist(product._id);

                  return (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product)}
                      className="w-full max-w-[220px] mx-auto cursor-pointer group"
                    >
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`w-full h-[280px] object-cover rounded ${
                            isOutOfStock ? "grayscale opacity-40" : ""
                          }`}
                        />

                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          animate={{ scale: isWishlisted ? 1.2 : 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 10,
                          }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!user) {
                              toastWithVoice.error("Please log in to add to wishlist");
                              return;
                            }
                            const added = await toggleWishlist(product._id);
                            toastWithVoice.success(
                              added ? "Added to wishlist" : "Removed from wishlist"
                            );
                          }}
                          className="absolute top-2 right-2 z-0 rounded-full p-1 text-white bg-black/50 hover:bg-black/70 transition"
                        >
                          {isWishlisted ? (
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                          ) : (
                            <HeartIcon className="w-5 h-5" />
                          )}
                        </motion.button>
                      </div>

                      <h3 className="text-base font-medium mt-2 truncate">
                        {product.name}
                      </h3>

                      <p className="text-blue-100 font-bold text-base text-center">
                        {formatPrice(product.price)}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isOutOfStock) {
                            toastWithVoice.error("You've reached the stock limit");
                            return;
                          }

                          addToCart({
                            id: product._id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            quantity: 1,
                          });

                          toastWithVoice.success("Added to cart");
                        }}
                        disabled={isOutOfStock}
                        className={`mt-2 px-4 py-2 rounded-full font-semibold transition duration-200 ease-in-out w-full ${
                          isOutOfStock
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                        }`}
                      >
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
