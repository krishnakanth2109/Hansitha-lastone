import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { uploadImageToCloudinary } from '../components/cloudinary';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const AddProduct: React.FC = () => {
  const { setProducts } = useContext(ProductContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [ceoCollection, setCeoCollection] = useState(false);
  const [description, setDescription] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);

  // ✅ FIX: Store extra images as { file, previewUrl } pairs so preview
  // and file stay perfectly in sync — no more index mismatch bugs.
  const [extraImages, setExtraImages] = useState<{ file: File; previewUrl: string }[]>([]);

  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handlePriceChange = (val: string) => {
    setPrice(val);
    const op = Number(originalPrice);
    const p = Number(val);
    if (op > 0 && p > 0 && op > p) {
      setDiscountPercentage(Math.round(((op - p) / op) * 100).toString());
    } else {
      setDiscountPercentage('');
    }
  };

  const handleOriginalPriceChange = (val: string) => {
    setOriginalPrice(val);
    const op = Number(val);
    const p = Number(price);
    if (op > 0 && p > 0 && op > p) {
      setDiscountPercentage(Math.round(((op - p) / op) * 100).toString());
    } else {
      setDiscountPercentage('');
    }
  };

  const handleDiscountPercentageChange = (val: string) => {
    setDiscountPercentage(val);
    const op = Number(originalPrice);
    const d = Number(val);
    if (op > 0 && d > 0 && d < 100) {
      setPrice(Math.round(op * (1 - d / 100)).toString());
    }
  };

  // ✅ FIX: Build { file, previewUrl } objects immediately on selection
  const handleAddExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    const availableSlots = 3 - extraImages.length;
    if (availableSlots <= 0) {
      toast.error('Maximum 3 extra images already added.');
      e.target.value = '';
      return;
    }

    const filesToAdd = newFiles.slice(0, availableSlots);
    const newEntries = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),  // ✅ created immediately, stays stable
    }));

    setExtraImages((prev) => [...prev, ...newEntries]);
    e.target.value = ''; // reset so same file can be re-added if removed
  };

  // ✅ FIX: Remove by index from the single source-of-truth array
  const handleRemoveExtraImage = (index: number) => {
    setExtraImages((prev) => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) { toast.error('Please upload a main image'); return; }
    if (!category) { toast.error('Please select a category'); return; }
    if (!description.trim()) { toast.error('Please enter a product description'); return; }

    const op = Number(originalPrice);
    const p = Number(price);
    if (op > 0 && p > 0 && p >= op) {
      toast.error('Offer price must be less than original price (MRP)');
      return;
    }

    try {
      setUploading(true);

      const imageUrl = await uploadImageToCloudinary(imageFile);

      // ✅ FIX: Upload using the .file from each entry
      const extraImageUrls = extraImages.length > 0
        ? await Promise.all(extraImages.map((entry) => uploadImageToCloudinary(entry.file)))
        : [];

      const finalDiscount = op > 0 && p > 0 && op > p
        ? Math.round(((op - p) / op) * 100)
        : Number(discountPercentage) || 0;

      const productData = {
        name,
        price: p,
        originalPrice: op || null,
        discountPercentage: finalDiscount,
        stock: Number(stock),
        featured,
        newArrival,
        ceoCollection,
        category,
        description,
        image: imageUrl,
        extraImages: extraImageUrls,
      };

      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error('Add failed');
      const savedProduct = await res.json();

      setProducts((prev: any) => [...prev, savedProduct]);
      toast.success('Product added successfully!');
      resetForm();

      setTimeout(() => { navigate('/admin?page=1'); }, 1000);
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setOriginalPrice('');
    setDiscountPercentage('');
    setStock('');
    setFeatured(false);
    setNewArrival(false);
    setCeoCollection(false);
    setCategory('');
    setDescription('');
    setImageFile(null);
    // Revoke all preview URLs before clearing
    extraImages.forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
    setExtraImages([]);
  };

  const savingsPreview = Number(originalPrice) > 0 && Number(price) > 0 && Number(originalPrice) > Number(price)
    ? Number(originalPrice) - Number(price)
    : null;

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-screen-xl mx-auto">
      <div className="flex gap-4 border-b pb-3 mb-6">
        <button onClick={() => navigate('/admin')} className="text-blue-600 border-b-2 border-blue-600 font-semibold">
          Add Product
        </button>
        <button onClick={() => navigate('/admin/manage')} className="text-gray-500 hover:text-blue-600">
          Manage Products
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">Add Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Product Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. Banarasi Silk Saree"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Stock</label>
            <input
              type="number" value={stock} onChange={(e) => setStock(e.target.value)} required
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. 10"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-blue-900 text-base">Pricing</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1 text-sm">
                Original Price / MRP (₹)
                <span className="ml-1 text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="number" value={originalPrice}
                onChange={(e) => handleOriginalPriceChange(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="e.g. 2000" min="0"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-sm">
                Discount %
                <span className="ml-1 text-gray-400 font-normal text-xs">(auto-calculated)</span>
              </label>
              <input
                type="number" value={discountPercentage}
                onChange={(e) => handleDiscountPercentageChange(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="e.g. 20" min="0" max="99"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-sm">
                Offer / Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number" value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                required
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm font-bold bg-white ring-1 ring-blue-300"
                placeholder="e.g. 1599" min="0"
              />
            </div>
          </div>

          {savingsPreview !== null && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-md px-3 py-2 text-sm">
              <span className="text-green-700 font-semibold">
                🎉 Customer saves ₹{savingsPreview.toLocaleString('en-IN')}
              </span>
              {discountPercentage && (
                <span className="bg-green-500 text-white font-bold px-2 py-0.5 rounded-sm text-xs">
                  {discountPercentage}% OFF
                </span>
              )}
              <span className="text-gray-500 text-xs">
                MRP ₹{Number(originalPrice).toLocaleString('en-IN')} → ₹{Number(price).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Write product details here..."
          />
        </div>

        {/* Flags */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 bg-gray-50 p-4 rounded border border-gray-200 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-blue-600 w-4 h-4 cursor-pointer" />
            <span className="text-sm font-medium">Featured Product</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="accent-blue-600 w-4 h-4 cursor-pointer" />
            <span className="text-sm font-medium">New Arrival</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={ceoCollection} onChange={(e) => setCeoCollection(e.target.checked)} className="accent-blue-600 w-4 h-4 cursor-pointer" />
            <span className="text-sm font-medium">CEO Collection</span>
          </label>
        </div>

        {/* Main Image */}
        <div>
          <label className="block font-medium mb-1">Main Product Image <span className="text-red-500">*</span></label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm" />
          {imageFile && (
            <div className="mt-4">
              <img src={URL.createObjectURL(imageFile)} alt="Main preview" className="w-40 h-40 object-cover rounded border" />
            </div>
          )}
        </div>

        {/* ✅ FIXED: Extra Images */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-medium">Extra Images (Up to 3)</label>
            <span className="text-sm text-gray-500">{extraImages.length} / 3 Uploaded</span>
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            disabled={extraImages.length >= 3}
            onChange={handleAddExtraImages}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {extraImages.length >= 3 && (
            <p className="text-xs text-red-500 mt-1">Maximum 3 extra images reached.</p>
          )}

          {/* ✅ FIXED: Render directly from extraImages — single source of truth */}
          {extraImages.length > 0 && (
            <div className="mt-4 flex gap-4 flex-wrap">
              {extraImages.map((entry, idx) => (
                <div key={idx} className="relative group border p-1 rounded bg-gray-50">
                  <img
                    src={entry.previewUrl}
                    className="w-24 h-24 object-cover rounded"
                    alt={`extra-${idx}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExtraImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 shadow-md"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit" disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? 'Uploading...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;