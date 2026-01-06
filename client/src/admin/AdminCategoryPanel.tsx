import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_BASE = import.meta.env.VITE_API_URL;

type Category = {
  _id?: string;
  name: string;
  image: string;
};

const AdminCategoryPanel = () => {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setRawImage(imageURL);
      setCropModalOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!name || !imageFile) {
      toast.error('Category name and image are required.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryRes = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryData = await cloudinaryRes.json();
      const imageUrl = cloudinaryData.secure_url;
      if (!imageUrl) throw new Error('Image upload failed');

      const mongoRes = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image: imageUrl }),
      });

      if (!mongoRes.ok) throw new Error('Failed to save category');

      await fetchCategories();
      toast.success('Category added!');
      setName('');
      setImageFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
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
    } catch (err) {
      console.error(err);
      toast.error('Error deleting category');
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const parsed = results.data as Category[];
        let successCount = 0;
        let errorCount = 0;

        for (const cat of parsed) {
          if (!cat.name || !cat.image) {
            errorCount++;
            continue;
          }

          try {
            const res = await fetch(`${API_BASE}/api/categories`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cat),
            });

            if (!res.ok) throw new Error('Failed to add');

            successCount++;
          } catch (err) {
            console.error(err);
            errorCount++;
          }
        }

        toast.success(`${successCount} categories added, ${errorCount} failed`);
        await fetchCategories();
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold">Manage Categories</h2>

        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="w-full p-2 border rounded"
          />

          <div
            className="w-full h-40 border-2 border-dashed rounded flex items-center justify-center bg-gray-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <AnimatePresence>
              {previewUrl ? (
                <motion.img
                  key={previewUrl}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  src={previewUrl}
                  alt="preview"
                  className="h-full object-contain rounded"
                />
              ) : (
                <motion.span
                  key="placeholder"
                  className="text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Drag & drop image here
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleUpload}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Add Category'}
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Bulk Upload via CSV</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Existing Categories</h3>
          <ul className="space-y-4">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="flex items-center justify-between bg-gray-100 p-3 rounded shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                  <span className="text-lg font-medium">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRawImage(cat.image);
                      setCropModalOpen(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id!)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Crop Modal */}
      <AnimatePresence>
        {cropModalOpen && rawImage && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">Crop Image</h3>
              <div className="relative w-full h-64 bg-gray-200 rounded overflow-hidden">
                <Cropper
                  image={rawImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                />
              </div>
              <div className="flex justify-between mt-4">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setCropModalOpen(false);
                      setRawImage(null);
                    }}
                    className="px-3 py-1 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const croppedFile = await getCroppedImg(rawImage!, croppedAreaPixels);
                      setImageFile(croppedFile);
                      setPreviewUrl(URL.createObjectURL(croppedFile));
                      setCropModalOpen(false);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategoryPanel;
