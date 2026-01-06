import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ProductContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { toastWithVoice } from "@/utils/toast";
import { Heart, HeartIcon, Share2, X, ZoomIn } from "lucide-react"; // Added ZoomIn for clarity
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
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ProductDetailsPage = () => {
  const { formatPrice } = useCurrency();
  const { name } = useParams();
  const location = useLocation();
  const { products } = useContext(ProductContext);
  const { addToCart, cartItems } = useCart();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
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

  const allImages = product ? [...new Set([product.image, ...(product.extraImages || [])])] : [];

  const handleNextImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  };

  useEffect(() => {
    if (!autoScroll || allImages.length <= 1) return;
    const interval = setInterval(handleNextImage, 3000);
    return () => clearInterval(interval);
  }, [autoScroll, allImages, selectedImage]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    if (isMaxQuantityReached) {
      toastWithVoice.error("You’ve already added maximum stock.");
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

  if (isLoading) return <div className="p-6 text-center min-h-screen">Loading...</div>;
  if (!product) return <div className="p-6 text-center min-h-screen">Product not found.</div>;

  const related = products.filter((p) => p.category === product.category && p._id !== product._id);
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    // ✅ STYLE FIX: Added theme-aware background to the root element
    <div className="bg-background text-foreground">
      {isSearchOpen && (
        <>
          <SearchSidebar isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSearchOpen(false)} />
        </>
      )}

      <AnimatePresence>
        {showZoom && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowZoom(false)}
          >
            <motion.img
              src={selectedImage} alt="Zoomed"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
            />
            <button className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2" onClick={() => setShowZoom(false)}>
              <X />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ✅ STYLE FIX: Changed p-6 to use a consistent container */}
      <div className="container mx-auto p-4 md:p-6 pb-24 md:pb-6">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* --- Left Section: Images (Your original structure) --- */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
             {/* Vertical Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {allImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setSelectedImage(img)}
                  className={`w-24 h-24 object-cover rounded-lg border-2 cursor-pointer flex-shrink-0 transition-all ${
                    selectedImage === img ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                   alt={`Thumbnail ${i + 1}`}
                />
              ))}
            </div>

            {/* Main Image */}
            <div className="relative w-full group">
              <img
                src={selectedImage}
                onMouseEnter={() => setAutoScroll(false)}
                onMouseLeave={() => setAutoScroll(true)}
                className="w-full h-auto max-h-[660px] aspect-[4/5] object-cover rounded-lg shadow-lg border border-border"
                alt={product.name}
              />
               <div
                onClick={() => setShowZoom(true)}
                className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center cursor-zoom-in transition-opacity duration-300 rounded-lg"
              >
                <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* --- Right Section: Details (Your original structure with corrected styles) --- */}
          <div className="text-foreground">
            <div className="mb-2 flex gap-2">
              {product.featured && <Badge variant="outline">Featured Product</Badge>}
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">{product.name}</h1>
            <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
            
            <div className="flex items-center justify-start mb-2">
              {/* ✅ PRICE FIX: Removed hardcoded blue color, now uses theme-aware color */}
              <p className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </p>
            </div>

            {lowStock && <p className="text-destructive text-sm mb-2">Hurry! Only {product.stock} left in stock.</p>}
            
            <div className="flex flex-col items-start gap-2 mb-6">
              <div className="flex items-center gap-4">
                 {/* ✅ STYLE FIX: Theme-aware quantity buttons */}
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</Button>
                <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.stock - cartQuantity, quantity + 1))} disabled={isMaxQuantityReached}>+</Button>
              </div>

              <span className={`text-sm font-medium ${isMaxQuantityReached || product.stock === 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {product.stock === 0 ? "Out of Stock" : isMaxQuantityReached ? "Max Stock Added" : `In Stock: ${product.stock - cartQuantity}`}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isMaxQuantityReached}
              >
                {product.stock === 0 ? "Out of Stock" : isMaxQuantityReached ? "Max Stock Added" : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
              >
                <Heart className={`w-6 h-6 ${isInWishlist(product._id) ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button onClick={handleShare} variant="outline" size="lg"> <Share2 className="w-4 h-4" /> </Button>
            </div>

            <Separator className="my-6" />
            
             {/* ✅ TABS FIX: Fully theme-aware */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="sizing">Size Guide</TabsTrigger>
                <TabsTrigger value="care">Care</TabsTrigger>
              </TabsList>
              <div className="mt-1 p-4 border rounded-b-md">
                  <TabsContent value="description" className="prose prose-sm max-w-none dark:prose-invert">
                    <h4>Product Features</h4>
                    <ul>
                        <li>Premium sustainable cotton blend fabric</li>
                        <li>Hand-embroidered detailing</li>
                        <li>Flowing midi length silhouette</li>
                    </ul>
                  </TabsContent>
                  <TabsContent value="sizing" className="prose prose-sm max-w-none dark:prose-invert">
                    <h4>Size Chart</h4>
                    <p>All measurements in inches.</p>
                     {/* Your original size chart grid here */}
                     <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="font-semibold">Size</div>
                        <div className="font-semibold">Bust</div>
                        <div className="font-semibold">Waist</div>
                        <div className="font-semibold">Hip</div>
                        <div>XS</div><div>32-34</div><div>26-28</div><div>36-38</div>
                        <div>S</div><div>34-36</div><div>28-30</div><div>38-40</div>
                        <div>M</div><div>36-38</div><div>30-32</div><div>40-42</div>
                        <div>L</div><div>38-40</div><div>32-34</div><div>42-44</div>
                        <div>XL</div><div>40-42</div><div>34-36</div><div>44-46</div>
                      </div>
                  </TabsContent>
                  <TabsContent value="care" className="prose prose-sm max-w-none dark:prose-invert">
                    <h4>Care Instructions</h4>
                    <ul>
                        <li>Machine wash cold with like colors</li>
                        <li>Use gentle cycle and mild detergent</li>
                        <li>Hang dry or tumble dry on low heat</li>
                    </ul>
                  </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Related Products</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1" {...swipeHandlers} id="related-scroll">
              {related.map((item) => (
                <div key={item._id} className="relative min-w-[180px] text-left">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    animate={{ scale: isInWishlist(item._id) ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user) {
                        toastWithVoice.error("Please log in to add to wishlist");
                        return;
                      }
                      await toggleWishlist(item._id);
                    }}
                    className="absolute top-2 right-2 z-10 rounded-full p-1 text-white bg-black/50 hover:bg-black/70 transition"
                  >
                    {isInWishlist(item._id) ? (
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                  </motion.button>
                  <button
                    onClick={() => navigate(`/product/${encodeURIComponent(item.name)}`, { state: { product: item } })}
                    className="text-left text-foreground"
                  >
                    <img src={item.image} className="w-[180px] h-[300px] object-cover rounded border border-border" alt={item.name}/>
                    <h3 className="mt-2 font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="font-bold text-primary">{formatPrice(item.price)}</p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden pb-safe">
        <BottomNavBar
          onSearchClick={() => setSearchOpen(true)}
          onAccountClick={() => navigate(user ? "/account" : "/login")}
        />
      </div>
    </div>
  );
};

export default ProductDetailsPage;