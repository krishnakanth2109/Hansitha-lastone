import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react'; // Import a close icon
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const CarouselManager = () => {
  const [selectedCarousel, setSelectedCarousel] = useState('carousel1');
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [carouselData, setCarouselData] = useState([]);
  
  // --- CROPPER STATE ---
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [cropTarget, setCropTarget] = useState<'desktop' | 'mobile' | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [originalFileName, setOriginalFileName] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  // 1. Get the variable from .env
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchCarousels = async () => {
    try {
      const res = await fetch(`${API_URL}/api/carousel-images`);
      const data = await res.json();
      setCarouselData(data);
    } catch (error) {
      console.error("Error fetching carousels:", error);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, []);

  // --- CROPPER LOGIC ---
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCropTarget(target);
      setOriginalFileName(file.name);
      
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      
      // Reset input so the same file can be selected again if needed
      e.target.value = ''; 
    }
  };

  const closeCropModal = () => {
    setCropModalOpen(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setCropTarget(null);
  };

  const generateCroppedImage = async () => {
    if (!imgRef.current || !completedCrop) {
      // If user didn't draw a crop area, just use the original image
      closeCropModal();
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // ✅ FIX: Canvas must be sized to NATURAL (actual) pixels, not CSS display pixels.
    // completedCrop values are in CSS pixels — multiply by scale to get real resolution.
    // Without this, the canvas is tiny and the image gets stretched back up → blurry.
    canvas.width = Math.round(completedCrop.width * scaleX);
    canvas.height = Math.round(completedCrop.height * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the cropped area at full natural resolution
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,   // ✅ destination = full natural size
      canvas.height
    );

    // ✅ FIX: Explicit quality 1.0 = maximum, no compression loss
    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], originalFileName, { type: 'image/jpeg' });

      if (cropTarget === 'desktop') {
        setDesktopFile(croppedFile);
      } else if (cropTarget === 'mobile') {
        setMobileFile(croppedFile);
      }
      closeCropModal();
    }, 'image/jpeg', 1.0);  // ✅ 1.0 = maximum quality
  };

  // --- UPLOAD & DELETE LOGIC ---
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('carouselId', selectedCarousel);
    if (desktopFile) formData.append('image', desktopFile);
    if (mobileFile) formData.append('mobileImage', mobileFile);

    try {
      const res = await fetch(`${API_URL}/api/upload-carousel`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert('Uploaded!');
        setDesktopFile(null);
        setMobileFile(null);
        fetchCarousels();
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      alert('Upload failed due to network error');
    }
  };

  const handleDelete = async (carouselId: string) => {
    if (!window.confirm(`Delete ${carouselId}?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/api/delete-carousel/${carouselId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('Deleted!');
        fetchCarousels();
      } else {
        alert('Delete failed: ' + data.message);
      }
    } catch (error) {
      alert('Delete failed due to network error');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 relative">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold">Banner Manager</h2>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4 border-b pb-6">
          <div>
            <label className="block font-semibold mb-1">Select Banner</label>
            <select
              value={selectedCarousel}
              onChange={(e) => setSelectedCarousel(e.target.value)}
              className="w-full p-2 border rounded outline-none focus:border-blue-500"
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
                onChange={(e) => onSelectFile(e, 'desktop')}
                className="w-full sm:w-auto border p-1 rounded"
              />
              {desktopFile && (
                <button
                  type="button"
                  onClick={() => setDesktopFile(null)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
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
                onChange={(e) => onSelectFile(e, 'mobile')}
                className="w-full sm:w-auto border p-1 rounded"
              />
              {mobileFile && (
                <button
                  type="button"
                  onClick={() => setMobileFile(null)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
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

          <button className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors">
            Upload
          </button>
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
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1 font-medium">Mobile Image</p>
                  {item.mobileImageUrl ? (
                    <img src={item.mobileImageUrl} alt="Mobile" className="w-full h-40 object-cover mb-2 rounded" />
                  ) : (
                    <p className="text-gray-400">No mobile image</p>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2 font-bold uppercase">{item.carouselId}</p>
                <button
                  onClick={() => handleDelete(item.carouselId)}
                  className="mt-3 bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 w-full transition-colors"
                >
                  Delete Banner
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CROP MODAL --- */}
      <AnimatePresence>
        {cropModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-4 md:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-xl font-bold">
                  Crop Image ({cropTarget === 'desktop' ? 'Desktop' : 'Mobile'})
                </h3>
                <button onClick={closeCropModal} className="text-gray-500 hover:text-black transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center rounded-lg border">
                {imgSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                  >
                    <img 
                      ref={imgRef} 
                      src={imgSrc} 
                      alt="Crop target" 
                      className="max-h-[60vh] w-auto object-contain" 
                    />
                  </ReactCrop>
                )}
              </div>
              
              <div className="mt-4 flex justify-end gap-3 pt-3 border-t">
                <button 
                  onClick={closeCropModal} 
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={generateCroppedImage} 
                  className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Confirm Crop
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CarouselManager;