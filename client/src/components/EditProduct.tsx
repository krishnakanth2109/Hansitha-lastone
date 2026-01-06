import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductContext } from "../context/ProductContext";
import { uploadImageToCloudinary } from "../components/cloudinary";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const categoryOptions = [
  "Cotton",
  "Silk",
  "Crape",
  "Kota",
  "Georgette",
  "Tusser",
  "Handlooms",
  "new-arrivals",
  "ceo-collections",
];

const EditProduct: React.FC = () => {
  const { setProducts } = useContext(ProductContext);
  const { productId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState("");
  const [extraImageFiles, setExtraImageFiles] = useState<File[]>([]);
  const [extraImagesPreview, setExtraImagesPreview] = useState<string[]>([]);
  const [existingExtraImages, setExistingExtraImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${productId}`);
        const data = await res.json();
        setName(data.name);
        setPrice(data.price.toString());
        setStock(data.stock.toString());
        setCategory(data.category);
        setFeatured(data.featured);
        setDescription(data.description);
        setExistingImage(data.image);
        setExistingExtraImages(data.extraImages || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch product");
      }
    };
    fetchProduct();
  }, [productId]);

  const handleRemoveExistingExtraImage = (index: number) => {
    setExistingExtraImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploading(true);

      let imageUrl = existingImage;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const uploadedExtraImages =
        extraImageFiles.length > 0
          ? await Promise.all(
              extraImageFiles.slice(0, 3).map(uploadImageToCloudinary)
            )
          : [];

      const productData = {
        name,
        price: Number(price),
        stock: Number(stock),
        featured,
        category,
        description,
        image: imageUrl,
        extraImages: [...existingExtraImages, ...uploadedExtraImages],
      };

      // 💡 Add stock only if it's a valid number
      if (stock !== "" && !isNaN(Number(stock))) {
        productData.stock = Number(stock);
      }

      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Update failed");

      const updatedProduct = await res.json();

      // ✅ Replace product in context
      setProducts((prev: any) =>
        prev.map((p: any) =>
          p._id === updatedProduct._id ? updatedProduct : p
        )
      );

      toast.success("✅ Product updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong while updating.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-screen-xl mx-auto">
      <div className="flex gap-4 border-b pb-3 mb-6">
        <button
          onClick={() => navigate("/admin/manage")}
          className="text-gray-500 hover:text-blue-600"
        >
          Product Management
        </button>

        <button
          onClick={() => navigate("/admin/manage")}
          className="text-blue-600 border-b-2 border-blue-600 font-semibold"
        >
          Manage Products
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="hidden font-medium mb-1">Stock</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            >
              <option value="">Select a category</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            id="featured"
            className="accent-blue-600"
          />
          <label htmlFor="featured" className="text-sm font-medium">
            Mark as Featured Product
          </label>
        </div>

        <div>
          <label className="block font-medium mb-1">Main Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
          {imageFile ? (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-40 h-40 object-cover rounded border"
              />
            </div>
          ) : existingImage ? (
            <div className="mt-4">
              <img
                src={existingImage}
                alt="Existing"
                className="w-40 h-40 object-cover rounded border"
              />
            </div>
          ) : null}
        </div>

        <div>
          <label className="block font-medium mb-1">Extra Images (Max 3)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, 3);
              setExtraImageFiles(files);
              setExtraImagesPreview(
                files.map((file) => URL.createObjectURL(file))
              );
            }}
            className="w-full text-sm"
          />
          {(existingExtraImages.length > 0 ||
            extraImagesPreview.length > 0) && (
            <div className="mt-4 flex gap-3 flex-wrap">
              {existingExtraImages.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    className="w-24 h-24 object-cover rounded border"
                    alt={`extra-${idx}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingExtraImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
              {extraImagesPreview.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  className="w-24 h-24 object-cover rounded border"
                  alt={`preview-${idx}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
