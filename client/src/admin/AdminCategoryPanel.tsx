import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { Pencil, Trash2, UploadCloud, X, AlertCircle } from 'lucide-react'; 

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_BASE = import.meta.env.VITE_API_URL;

type Category = {
  _id?: string;
  name: string;
  image: string;
};

const AdminCategoryPanel = () => {
  // Form State
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Validation State
  const [errors, setErrors] = useState({ name: '', image: '' });
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // App State
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cropper State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawImage, setRawImage] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      toast.error('Failed to load categories');
    }
  };

  // --- Image Handling ---
  const processSelectedFile = (file: File) => {
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setRawImage(imageURL);
      setCropModalOpen(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
    // Reset input so the same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  // --- Form Actions ---
  const resetForm = () => {
    setName('');
    setImageFile(null);
    setPreviewUrl(null);
    setEditingId(null);
    setErrors({ name: '', image: '' }); // Clear errors on reset
  };

  const handleEditClick = (category: Category) => {
    setEditingId(category._id || null);
    setName(category.name);
    setPreviewUrl(category.image);
    setImageFile(null); // Reset file, we will only upload if they pick a new one
    setErrors({ name: '', image: '' }); // Clear errors when editing starts
    
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    // Validation Checks
    let isValid = true;
    const newErrors = { name: '', image: '' };

    if (!name.trim()) {
      newErrors.name = 'Category name is required.';
      isValid = false;
    }
    
    // If we are NOT editing, an image is absolutely required.
    if (!editingId && !imageFile && !previewUrl) {
      newErrors.image = 'Category image is required.';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      toast.error('Please fix the errors before submitting.');
      return;
    }

    setUploading(true);

    try {
      let finalImageUrl = previewUrl; // Default to existing image if editing

      // If user selected a NEW image, upload it to Cloudinary
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryRes = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        });

        const cloudinaryData = await cloudinaryRes.json();
        finalImageUrl = cloudinaryData.secure_url;
        if (!finalImageUrl) throw new Error('Image upload failed');
      }

      // API Call: PUT if editing, POST if new
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${API_BASE}/api/categories/${editingId}` 
        : `${API_BASE}/api/categories`;

      const mongoRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), image: finalImageUrl }),
      });

      if (!mongoRes.ok) throw new Error(`Failed to ${editingId ? 'update' : 'save'} category`);

      await fetchCategories();
      toast.success(`Category ${editingId ? 'updated' : 'added'} successfully!`);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(`Operation failed`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');

      await fetchCategories();
      toast.success('Category deleted');
      
      // If we are currently editing the deleted category, reset the form
      if (editingId === id) resetForm();
    } catch (err) {
      console.error(err);
      toast.error('Error deleting category');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>
          {editingId && (
            <button 
              onClick={resetForm}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>

        {/* Input Form */}
        <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' })); // Clear error on typing
              }}
              placeholder="e.g. Cotton Sarees"
              className={`w-full p-3 border rounded-lg outline-none transition-all ${
                errors.name 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Image <span className="text-red-500">*</span>
            </label>
            <div
              className={`w-full h-48 border-2 border-dashed rounded-xl flex items-center justify-center transition-colors cursor-pointer relative overflow-hidden group ${
                errors.image 
                  ? 'border-red-400 bg-red-50 hover:bg-red-100' 
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*"
              />
              
              <AnimatePresence>
                {previewUrl ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full flex items-center justify-center p-2"
                  >
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="h-full object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <p className="text-white font-medium flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" /> Click or Drop to change
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    className={`${errors.image ? 'text-red-400' : 'text-gray-400'} flex flex-col items-center gap-2`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <UploadCloud className={`w-8 h-8 ${errors.image ? 'text-red-400' : 'text-gray-400'}`} />
                    <span>Click or drag & drop image here</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.image && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.image}
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all shadow-sm ${
              uploading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : editingId 
                  ? 'bg-green-600 hover:bg-green-700 shadow-green-200 hover:shadow-md' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-md'
            }`}
            disabled={uploading}
          >
            {uploading ? 'Processing...' : editingId ? 'Update Category' : 'Add Category'}
          </button>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Existing Categories</h3>
          
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No categories found. Add one above.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className={`flex items-center justify-between bg-white border p-3 rounded-xl shadow-sm transition-all ${
                    editingId === cat._id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    />
                    <span className="text-md font-medium text-gray-700 truncate">{cat.name}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      <AnimatePresence>
        {cropModalOpen && rawImage && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Crop Image (1:1 Ratio)</h3>
              <div className="relative w-full h-64 bg-gray-200 rounded-xl overflow-hidden mb-6">
                <Cropper
                  image={rawImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels as any)}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setCropModalOpen(false);
                      setRawImage(null);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const croppedFile = await getCroppedImg(rawImage!, croppedAreaPixels);
                      if (croppedFile) {
                        setImageFile(croppedFile as File);
                        setPreviewUrl(URL.createObjectURL(croppedFile as Blob));
                        if (errors.image) setErrors((prev) => ({ ...prev, image: '' })); // Clear image error on successful crop
                      }
                      setCropModalOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategoryPanel;