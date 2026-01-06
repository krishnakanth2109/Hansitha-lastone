import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Heart, HeartIcon, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useWishlist } from "@/context/WishlistContext";
import { Footer } from "../components/Footer";
import clsx from "clsx";
import { toastWithVoice } from "@/utils/toast";

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { products, loading } = useProductContext();
  const { addToCart, cartItems } = useCart(); // make sure cartItems is available
  const { formatPrice } = useCurrency();
  const { wishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high">(
    "default"
  );
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024
  );
  const [showFilterMobile, setShowFilterMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, minPrice, maxPrice, category]);

  const totalFiltered = products.filter(
    (p) =>
      p.category?.toLowerCase().trim() === category?.toLowerCase().trim() &&
      p.price >= minPrice &&
      p.price <= maxPrice
  );

  const sorted = [...totalFiltered].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PRODUCTS_PER_PAGE);
  const paginated = sorted.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.name}`, { state: { product } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-400 to-pink-400">
      <main className="p-4 flex-grow">
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h2 className="text-2xl font-bold capitalize">{category} Fabrics</h2>
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
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
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
            <h2 className="text-2xl font-bold mb-4 hidden lg:block capitalize">
              {category} Fabrics
            </h2>

            {loading ? (
              <p>Loading products...</p>
            ) : paginated.length === 0 ? (
              <p>No products match your filters.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                  {paginated.map((product) => {
                    const cartQuantity =
                      cartItems.find((item) => item.id === product._id)
                        ?.quantity || 0;

                    const isOutOfStock = product.stock === 0;
                    const isMaxReached =
                      product.stock > 0 && cartQuantity >= product.stock;
                    const isWishlisted = wishlist.includes(product._id);

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
                              isOutOfStock || isMaxReached
                                ? "grayscale opacity-40"
                                : ""
                            }`}
                          />
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await toggleWishlist(product._id);
                            }}
                            className="absolute top-2 right-2 z-10 bg-white p-1 rounded-full shadow-md transition-transform duration-150 active:scale-110"
                          >
                            {isWishlisted ? (
                              <HeartIcon className="w-5 h-5 text-red-500 fill-red-500" />
                            ) : (
                              <Heart className="w-5 h-5 text-red-500" />
                            )}
                          </button>
                        </div>
                        <h3 className="text-base font-medium mt-2 truncate">
                          {product.name}
                        </h3>
                        <p className="text-blue-600 font-bold text-base text-center">
                          {formatPrice(product.price)}
                        </p>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();

                            if (isOutOfStock) {
                              toastWithVoice.error("Out of Stock!");
                              return;
                            }

                            if (isMaxReached) {
                              toastWithVoice.error(
                                "You’ve reached the max stock limit!"
                              );
                              return;
                            }

                            await addToCart({
                              id: product._id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              quantity: 1,
                            });

                            toastWithVoice.success("Added to cart!");
                          }}
                          disabled={isOutOfStock || isMaxReached}
                          className={`mt-2 px-4 py-2 rounded-full font-semibold transition duration-200 ease-in-out w-full ${
                            isOutOfStock || isMaxReached
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                          }`}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : isMaxReached
                            ? "Max Stock Added"
                            : "Add to Cart"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded border ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
