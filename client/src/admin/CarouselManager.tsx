import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CarouselManager = () => {
  const [selectedCarousel, setSelectedCarousel] = useState('carousel1');
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [carouselData, setCarouselData] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchCarousels = async () => {
    const res = await fetch(`${API_URL}/api/carousel-images`);
    const data = await res.json();
    setCarouselData(data);
  };

  useEffect(() => {
    fetchCarousels();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('carouselId', selectedCarousel);
    if (desktopFile) formData.append('image', desktopFile);
    if (mobileFile) formData.append('mobileImage', mobileFile);

    const res = await fetch('https://hansitha-web-storefront.onrender.com/api/upload-carousel', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert('Uploaded!');
      setDesktopFile(null);
      setMobileFile(null);
      resetFileInputs();
      fetchCarousels();
    } else {
      alert('Upload failed: ' + data.message);
    }
  };

  const resetFileInputs = () => {
    const desktopInput = document.getElementById('desktopInput') as HTMLInputElement;
    const mobileInput = document.getElementById('mobileInput') as HTMLInputElement;
    if (desktopInput) desktopInput.value = '';
    if (mobileInput) mobileInput.value = '';
  };

  const handleDelete = async (carouselId: string) => {
    if (!window.confirm(`Delete ${carouselId}?`)) return;
    const res = await fetch(`https://hansitha-web-storefront.onrender.com/api/delete-carousel/${carouselId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (res.ok) {
      alert('Deleted!');
      fetchCarousels();
    } else {
      alert('Delete failed: ' + data.message);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold">Banner Manager</h2>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4 border-b pb-6">
          <div>
            <label className="block font-semibold mb-1">Select Banner</label>
            <select
              value={selectedCarousel}
              onChange={(e) => setSelectedCarousel(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="carousel1">Banner 1</option>
              <option value="carousel2">Banner 2</option>
              <option value="carousel3">Banner 3</option>
            </select>
          </div>

          {/* Desktop Image Upload */}
          <div>
            <label className="block font-semibold mb-1">Upload Desktop Image</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
              <input
                id="desktopInput"
                type="file"
                accept="image/*"
                onChange={(e) => setDesktopFile(e.target.files?.[0] || null)}
                className="w-full sm:w-auto"
              />
              {desktopFile && (
                <button
                  type="button"
                  onClick={() => setDesktopFile(null)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
            <AnimatePresence>
              {desktopFile && (
                <motion.img
                  key={desktopFile.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  src={URL.createObjectURL(desktopFile)}
                  alt="Desktop Preview"
                  className="w-full object-contain rounded border max-h-[250px]"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Image Upload */}
          <div>
            <label className="block font-semibold mb-1">Upload Mobile Image</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
              <input
                id="mobileInput"
                type="file"
                accept="image/*"
                onChange={(e) => setMobileFile(e.target.files?.[0] || null)}
                className="w-full sm:w-auto"
              />
              {mobileFile && (
                <button
                  type="button"
                  onClick={() => setMobileFile(null)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
            <AnimatePresence>
              {mobileFile && (
                <motion.img
                  key={mobileFile.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  src={URL.createObjectURL(mobileFile)}
                  alt="Mobile Preview"
                  className="w-full object-contain rounded border max-h-[250px]"
                />
              )}
            </AnimatePresence>
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Upload</button>
        </form>

        {/* Existing Carousel Preview */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Existing Banners</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {carouselData.map((item: any) => (
              <div key={item.carouselId} className="border rounded p-4 shadow-sm bg-white">
                <div>
                  <p className="text-sm text-gray-500 mb-1 font-medium">Desktop Image</p>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="Desktop" className="w-full h-40 object-cover mb-2 rounded" />
                  ) : (
                    <p className="text-gray-400">No desktop image</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 font-medium">Mobile Image</p>
                  {item.mobileImageUrl ? (
                    <img src={item.mobileImageUrl} alt="Mobile" className="w-full h-40 object-cover mb-2 rounded" />
                  ) : (
                    <p className="text-gray-400">No mobile image</p>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2">{item.carouselId}</p>
                <button
                  onClick={() => handleDelete(item.carouselId)}
                  className="mt-3 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselManager;
