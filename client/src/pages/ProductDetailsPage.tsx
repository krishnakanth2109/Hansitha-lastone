import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ProductContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { toastWithVoice } from "@/utils/toast";
import { Heart, Share2, X, ZoomIn, ShoppingBag, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchSidebar from "../components/SearchSidebar";
import { Footer } from "../components/Footer";
import BottomNavBar from "../components/BottomNavBar";
import { useSwipeable } from "react-swipeable";
import { useCurrency } from "@/context/CurrencyContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "../components/PriceDisplay";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ProductDetailsPage = () => {
  const { formatPrice } = useCurrency();
  const { name } = useParams();
  const location = useLocation();
  const { products } = useContext(ProductContext);
  const { addToCart, cartItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const cartQuantity = cartItems.find((item) => item.id === product?._id)?.quantity || 0;
  const isMaxQuantityReached = cartQuantity >= (product?.stock || 0);

  const [showZoom, setShowZoom] = useState(false);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => document.getElementById("related-scroll")?.scrollBy({ left: 250, behavior: "smooth" }),
    onSwipedRight: () => document.getElementById("related-scroll")?.scrollBy({ left: -250, behavior: "smooth" }),
    trackMouse: true,
  });

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      window.scrollTo(0, 0);
      try {
        if (location.state?.product) {
          setProduct(location.state.product);
        } else if (name) {
          setProduct(null);
          const decodedName = decodeURIComponent(name);
          const res = await axios.get(`${API_URL}/api/products?name=${decodedName}`);
          if (res.data.length > 0) {
            setProduct(res.data[0]);
          } else {
            toastWithVoice.error("Product not found");
            navigate("/");
          }
        }
      } catch (err) {
        toastWithVoice.error("Error loading product");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [name, location.state, navigate]);

  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
      setQuantity(1);
    }
  }, [product]);

  // FIX: Removed new Set() — it was silently deduplicating and dropping images.
  // Now keeps main image first, then all extra images that aren't identical to main.
  const allImages = product
    ? [product.image, ...(product.extraImages || []).filter((img: string) => img && img !== product.image)]
    : [];

  const handleNextImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  };

  const handlePrevImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[prevIndex]);
  };

  useEffect(() => {
    if (!autoScroll || allImages.length <= 1) return;
    const interval = setInterval(handleNextImage, 3000);
    return () => clearInterval(interval);
  }, [autoScroll, allImages, selectedImage]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    if (isMaxQuantityReached) {
      toastWithVoice.error("You've already added maximum stock.");
      return;
    }
    const availableToAdd = product.stock - cartQuantity;
    const quantityToAdd = Math.min(quantity, availableToAdd);
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantityToAdd,
    });
    toastWithVoice.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;
    if (!isMaxQuantityReached) {
      const availableToAdd = product.stock - cartQuantity;
      const quantityToAdd = Math.min(quantity, availableToAdd);
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantityToAdd,
      });
    }
    navigate("/checkout");
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toastWithVoice.error("Login to use wishlist");
      navigate("/login");
      return;
    }
    await toggleWishlist(product._id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, text: product.description, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toastWithVoice.success("Link copied to clipboard!");
    }
  };

  if (isLoading) return <div className="p-6 text-center min-h-screen bg-white text-gray-800">Loading...</div>;
  if (!product) return <div className="p-6 text-center min-h-screen bg-white text-gray-800">Product not found.</div>;

  const related = products.filter((p) => p.category === product.category && p._id !== product._id);
  const lowStock = product.stock > 0 && product.stock <= 5;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = product.discountPercentage
    ? product.discountPercentage
    : hasDiscount
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const currentIndex = allImages.indexOf(selectedImage);

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {isSearchOpen && (
        <>
          <SearchSidebar isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSearchOpen(false)} />
        </>
      )}

      <AnimatePresence>
        {showZoom && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowZoom(false)}
          >
            <motion.img
              src={selectedImage} alt="Zoomed"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
            />
            <button className="absolute top-6 right-6 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition" onClick={() => setShowZoom(false)}>
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto p-4 md:p-6 pb-24 md:pb-6">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* ===================== Left Section: Images ===================== */}
          <div className="flex flex-col-reverse md:flex-row gap-4">

            {/* Vertical Thumbnails — all images including extras */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden pb-2 md:pb-0 md:max-h-[660px]">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSelectedImage(img); setAutoScroll(false); }}
                  className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg border-2 overflow-hidden transition-all focus:outline-none ${
                    selectedImage === img
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt={`View ${i + 1}`}
                  />
                </button>
              ))}
            </div>

            {/* Main Image with prev/next arrows when multiple images */}
            <div
              className="relative w-full group"
              onMouseEnter={() => setAutoScroll(false)}
              onMouseLeave={() => setAutoScroll(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={selectedImage}
                  className="w-full h-auto max-h-[500px] md:max-h-[660px] object-cover rounded-lg shadow-sm border border-gray-100"
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {/* Discount badge */}
              {hasDiscount && discountPct > 0 && product.stock > 0 && (
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-black px-2.5 py-1 rounded-md tracking-wide shadow-md z-10">
                  {discountPct}% OFF
                </div>
              )}

              {/* Prev / Next arrows — only shown when there are multiple images */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-1.5 z-10 transition"
                  >
                    <ChevronLeft size={20} className="text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-1.5 z-10 transition"
                  >
                    <ChevronRight size={20} className="text-gray-700" />
                  </button>
                </>
              )}

              {/* Image counter dot indicators */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setSelectedImage(allImages[i]); setAutoScroll(false); }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentIndex ? "bg-blue-600 w-4" : "bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Zoom overlay (desktop) */}
              <div
                onClick={() => setShowZoom(true)}
                className="absolute inset-0 bg-black/0 group-hover:bg-black/20 md:flex items-center justify-center cursor-zoom-in transition-all duration-300 rounded-lg hidden"
              >
                <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Zoom button (mobile) */}
              <button
                onClick={() => setShowZoom(true)}
                className="absolute bottom-10 right-4 bg-white/80 p-2 rounded-full shadow-md md:hidden z-10"
              >
                <ZoomIn size={20} />
              </button>
            </div>
          </div>

          {/* ===================== Right Section: Details ===================== */}
          <div className="text-gray-900 flex flex-col">
            <div className="mb-3 flex flex-wrap gap-2">
              {product.featured && <Badge variant="outline" className="border-gray-400 text-gray-700">Featured Product</Badge>}
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">{product.category}</Badge>
              {hasDiscount && (
                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                  On Sale
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">{product.description}</p>

            <div className="flex flex-col gap-1 mb-2">
              <PriceDisplay
                price={product.price}
                originalPrice={product.originalPrice}
                discountPercentage={product.discountPercentage}
                size="lg"
              />
              {hasDiscount && (
                <p className="text-green-600 text-sm font-semibold">
                  You save {formatPrice(product.originalPrice - product.price)}
                </p>
              )}
            </div>

            {lowStock && <p className="text-red-500 font-medium text-sm mb-2">Hurry! Only {product.stock} left in stock.</p>}

            <div className="flex flex-col items-start gap-2 mb-6 mt-2">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="border-gray-300 text-gray-700 h-10 w-10 rounded-md"
                >
                  -
                </Button>
                <span className="font-bold text-lg w-6 text-center text-gray-900">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock - cartQuantity, quantity + 1))}
                  disabled={isMaxQuantityReached}
                  className="border-gray-300 text-gray-700 h-10 w-10 rounded-md"
                >
                  +
                </Button>
              </div>

              <span className={`text-xs font-semibold ${isMaxQuantityReached || product.stock === 0 ? "text-red-500" : "text-gray-500"}`}>
                {product.stock === 0 ? "OUT OF STOCK" : isMaxQuantityReached ? "MAX STOCK REACHED" : `IN STOCK: ${product.stock - cartQuantity}`}
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isMaxQuantityReached}
                className={`w-full h-12 md:h-14 text-sm font-bold uppercase tracking-widest rounded-md transition-all ${
                  product.stock === 0 || isMaxQuantityReached
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                }`}
              >
                <ShoppingBag className="w-5 h-5 mr-2" /> Add to Cart
              </Button>

              <Button
                size="lg"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className={`w-full h-12 md:h-14 text-sm font-bold uppercase tracking-widest rounded-md transition-all shadow-md ${
                  product.stock === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed hidden"
                    : "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
                }`}
              >
                <Zap className="w-5 h-5 mr-2 fill-white" /> Buy Now
              </Button>

              <div className="flex gap-3 mt-1">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleToggleWishlist}
                  className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-semibold"
                >
                  <Heart className={`w-5 h-5 mr-2 ${isInWishlist(product._id) ? "fill-red-500 text-red-500 border-none" : ""}`} />
                  Wishlist
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-semibold"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <Separator className="my-8 bg-gray-200" />

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 text-gray-600 rounded-lg p-1 h-12">
                <TabsTrigger value="description" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-md">Description</TabsTrigger>
                <TabsTrigger value="sizing" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-md">Size Guide</TabsTrigger>
                <TabsTrigger value="care" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-md">Care</TabsTrigger>
              </TabsList>
              <div className="mt-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <TabsContent value="description" className="prose prose-sm max-w-none text-gray-700">
                  <h4 className="text-gray-900 font-bold mb-2">Product Features</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Premium quality materials</li>
                    <li>Intricate traditional detailing</li>
                    <li>Comfortable for all occasions</li>
                  </ul>
                </TabsContent>
                <TabsContent value="sizing" className="prose prose-sm max-w-none text-gray-700">
                  <h4 className="text-gray-900 font-bold mb-2">Size Chart</h4>
                  <p className="mb-2">Standard measurements apply.</p>
                </TabsContent>
                <TabsContent value="care" className="prose prose-sm max-w-none text-gray-700">
                  <h4 className="text-gray-900 font-bold mb-2">Care Instructions</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Gentle hand wash or dry clean</li>
                    <li>Do not bleach</li>
                  </ul>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* ===================== Extra Images Gallery Strip ===================== */}
        {/* Shows below the main product grid when there are extra images */}
        {product.extraImages && product.extraImages.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">More Views</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {/* Main image first */}
              <button
                type="button"
                onClick={() => { setSelectedImage(product.image); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`overflow-hidden rounded-xl border-2 transition-all ${
                  selectedImage === product.image ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <img src={product.image} alt="Main view" className="w-full h-48 object-cover" />
              </button>

              {/* Extra images */}
              {product.extraImages.map((img: string, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSelectedImage(img); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === img ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  <img src={img} alt={`View ${i + 2}`} className="w-full h-48 object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 px-1">Related Products</h2>
            <div className="flex gap-4 overflow-x-auto pb-6 -mx-1 px-1 no-scrollbar" {...swipeHandlers} id="related-scroll">
              {related.map((item) => {
                const itemHasDiscount = item.originalPrice && item.originalPrice > item.price;
                return (
                  <div key={item._id} className="relative min-w-[160px] md:min-w-[200px] text-left group">
                    <div className="relative overflow-hidden rounded-xl border border-gray-100">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!user) { toastWithVoice.error("Please log in to add to wishlist"); return; }
                          await toggleWishlist(item._id);
                        }}
                        className="absolute top-2 right-2 z-10 rounded-full p-2 text-gray-400 bg-white/90 hover:text-red-500 shadow-sm transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${isInWishlist(item._id) ? "fill-red-500 text-red-500" : ""}`} />
                      </motion.button>

                      {itemHasDiscount && (
                        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                          {item.discountPercentage
                            ? `${item.discountPercentage}% OFF`
                            : `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF`
                          }
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/product/${encodeURIComponent(item.name)}`, { state: { product: item } })}
                        className="text-left w-full block"
                      >
                        <img
                          src={item.image}
                          className="w-full h-[220px] md:h-[280px] object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={item.name}
                        />
                      </button>
                    </div>

                    <div
                      className="mt-3 cursor-pointer px-1"
                      onClick={() => navigate(`/product/${encodeURIComponent(item.name)}`, { state: { product: item } })}
                    >
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                      <PriceDisplay
                        price={item.price}
                        originalPrice={item.originalPrice}
                        discountPercentage={item.discountPercentage}
                        size="sm"
                        className="mt-1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden pb-safe bg-white border-t border-gray-200">
        <BottomNavBar
          onSearchClick={() => setSearchOpen(true)}
          onAccountClick={() => navigate(user ? "/account" : "/login")}
        />
      </div>
    </div>
  );
};

export default ProductDetailsPage;