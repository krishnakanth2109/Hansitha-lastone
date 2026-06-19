// client/src/admin/AdminAbout.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AdminAbout = () => {
  const [currentImages, setCurrentImages] = useState({ founderImage1: '', founderImage2: '', founderImage3: '' });
  const [files, setFiles] = useState({ founderImage1: null, founderImage2: null, founderImage3: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/about`).then(res => {
      if (res.data) setCurrentImages(res.data);
    }).catch(err => console.error(err));
  }, []);

  const handleFileChange = (e: any, type: string) => {
    setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.founderImage1 && !files.founderImage2 && !files.founderImage3) {
      return toast.error("Please select at least one image to update.");
    }

    setLoading(true);
    const formData = new FormData();
    if (files.founderImage1) formData.append('founderImage1', files.founderImage1);
    if (files.founderImage2) formData.append('founderImage2', files.founderImage2);
    if (files.founderImage3) formData.append('founderImage3', files.founderImage3);

    try {
      const res = await axios.post(`${API_URL}/api/about/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCurrentImages(res.data.data);
      setFiles({ founderImage1: null, founderImage2: null, founderImage3: null });
      toast.success("Founder images updated successfully!");
      (document.getElementById('about-form') as HTMLFormElement).reset();
    } catch (err) {
      toast.error("Failed to upload images.");
    } finally {
      setLoading(false);
    }
  };

  const ImageUploader = ({ label, type, currentUrl, description }: { label: string, type: string, currentUrl: string, description: string }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
      <div>
        <h3 className="font-bold text-gray-800">{label}</h3>
        <p className="text-xs text-gray-500 mb-4">{description}</p>
      </div>
      {currentUrl && (
        <img src={currentUrl} alt={label} className="w-full h-48 object-cover rounded-lg mb-4 bg-gray-100" />
      )}
      <div className="mt-auto">
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => handleFileChange(e, type)} 
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <ImageIcon className="w-8 h-8 text-blue-600" />
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Founder Collage Images</h2>
            <p className="text-sm text-gray-500">Upload 3 images to show in the Founder section on the About Page.</p>
        </div>
      </div>

      <form id="about-form" onSubmit={handleUpload} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImageUploader label="Founder Image 1" description="(Main Large Image)" type="founderImage1" currentUrl={currentImages.founderImage1} />
          <ImageUploader label="Founder Image 2" description="(Top Right Image)" type="founderImage2" currentUrl={currentImages.founderImage2} />
          <ImageUploader label="Founder Image 3" description="(Bottom Right Image)" type="founderImage3" currentUrl={currentImages.founderImage3} />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-[#0F172A] text-white px-8 py-3 rounded-lg font-bold hover:bg-black disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {loading ? 'Uploading...' : 'Save Founder Images'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAbout;