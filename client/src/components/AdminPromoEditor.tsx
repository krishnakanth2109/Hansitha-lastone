import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ChromePicker } from 'react-color';
import toast from 'react-hot-toast';

type Promo = {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  bgColor: string;
};

const BASE_URL = import.meta.env.VITE_API_URL;

const AdminPromoEditor = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [bgColor, setBgColor] = useState('#fde2e2');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    bgColor: '',
    image: null as File | null,
    imagePreview: null as string | null,
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/hero-promos`);
      setPromos(res.data);
    } catch (err) {
      toast.error('Failed to load promos');
      console.error(err);
    }
  };

  const handleAdd = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('description', description);
    formData.append('bgColor', bgColor);
    if (image) formData.append('image', image);

    try {
      await axios.post(`${BASE_URL}/api/hero-promos`, formData);
      toast.success('Promo added');
      resetAddForm();
      fetchPromos();
    } catch (err) {
      toast.error('Failed to add promo');
      console.error(err);
    }
  };

  const resetAddForm = () => {
    setTitle('');
    setSubtitle('');
    setDescription('');
    setBgColor('#fde2e2');
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (promo: Promo) => {
    setEditingId(promo._id);
    setEditForm({
      title: promo.title,
      subtitle: promo.subtitle,
      description: promo.description,
      bgColor: promo.bgColor,
      image: null,
      imagePreview: promo.image,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      subtitle: '',
      description: '',
      bgColor: '',
      image: null,
      imagePreview: null,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingId) return;
    const formData = new FormData();
    formData.append('title', editForm.title);
    formData.append('subtitle', editForm.subtitle);
    formData.append('description', editForm.description);
    formData.append('bgColor', editForm.bgColor);
    if (editForm.image) formData.append('image', editForm.image);

    try {
      await axios.put(`${BASE_URL}/api/hero-promos/${editingId}`, formData);
      toast.success('Promo updated');
      cancelEdit();
      fetchPromos();
    } catch (err) {
      toast.error('Update failed');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this promo?');
    if (!confirmed) return;
    try {
      await axios.delete(`${BASE_URL}/api/hero-promos/${id}`);
      toast.success('Deleted');
      fetchPromos();
    } catch (err) {
      toast.error('Failed to delete');
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4">Add New Promo</h2>

        <div className="flex flex-col-reverse md:flex-row gap-6">
          {/* Left Section - Inputs */}
          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Subtitle"
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border px-3 py-2 rounded"
            />

            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Promo
            </button>
          </div>

          {/* Right Section - Color and Image */}
          <div className="flex-1 space-y-6">
            <div>
              <label className="block mb-2 font-medium">Background Color</label>
              <ChromePicker
                color={bgColor}
                onChangeComplete={(color) => setBgColor(color.hex)}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Upload Image</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setImage(file || null);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setImagePreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {imagePreview && <img src={imagePreview} className="h-20 mt-2 rounded shadow" />}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold">Existing Promos</h2>
      <div className="space-y-6">
        {promos.map((promo) => (
          <div
            key={promo._id}
            className="p-4 rounded shadow"
            style={{ backgroundColor: editingId === promo._id ? editForm.bgColor : promo.bgColor }}
          >
            {editingId === promo._id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editForm.title}
                  placeholder="Title"
                  className="w-full border px-3 py-1 rounded"
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
                <input
                  type="text"
                  value={editForm.subtitle}
                  placeholder="Subtitle"
                  className="w-full border px-3 py-1 rounded"
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                />
                <input
                  type="text"
                  value={editForm.description}
                  placeholder="Description"
                  className="w-full border px-3 py-1 rounded"
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
                <ChromePicker
                  color={editForm.bgColor}
                  onChangeComplete={(color) => setEditForm({ ...editForm, bgColor: color.hex })}
                />

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setEditForm((prev) => ({
                        ...prev,
                        image: file || null,
                      }));
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setEditForm((prev) => ({
                            ...prev,
                            imagePreview: reader.result as string,
                          }));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {editForm.imagePreview && <img src={editForm.imagePreview} className="h-12" />}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleEditSubmit}
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-400 text-white px-4 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{promo.title}</h3>
                  <p>{promo.subtitle}</p>
                  <p className="text-sm text-gray-700">{promo.description}</p>
                  {promo.image && <img src={promo.image} className="h-12 mt-2" />}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(promo)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(promo._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPromoEditor;
