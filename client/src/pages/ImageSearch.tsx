import React, { useState } from "react";
import axios from "axios";
import { Upload, Image as ImageIcon, Loader2, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

const ImageSearch: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setHasSearched(false);
      setProducts([]);
      setKeywords([]);
    }
  };

  const handleSearch = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first!");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(`${API_URL}/api/products/image-search`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProducts(response.data.products);
      setKeywords(response.data.extractedKeywords);

      if (response.data.products.length === 0) {
        toast.info("No matching products found.");
      } else {
        toast.success(`Found ${response.data.products.length} matching products!`);
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to process image. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Visual Product Search
        </h1>
        <p className="text-gray-600">
          Upload an image of a saree, fabric, or dress, and our AI will find similar products in our store.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Upload Section */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-48 object-contain rounded-md shadow-sm"
                />
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 5MB)</span>
                </>
              )}
            </label>
          </div>

          <button
            onClick={handleSearch}
            disabled={!selectedFile || isLoading}
            className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              "Search Products"
            )}
          </button>

          {keywords.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">AI Detected Attributes:</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="w-full md:w-2/3">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[300px]">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p>Searching our catalog for matches...</p>
            </div>
          ) : hasSearched && products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl min-h-[300px]">
              <SearchX className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600">No exact matches found</h3>
              <p className="text-sm mt-2">Try uploading a clearer image or a different angle.</p>
            </div>
          ) : products.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-6">
                Matching Products ({products.length})
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link to={`/product/${product.name}`} key={product._id} className="group">
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.stock <= 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Sold Out
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                        <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
                        <p className="font-semibold mt-2">₹{product.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl min-h-[300px]">
              <ImageIcon className="w-16 h-16 mb-4 text-gray-200" />
              <p>Upload an image and hit search to see results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSearch;