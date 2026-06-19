import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Trash2, Plus, Loader2, Edit3, Save, MapPin, 
  ArrowLeft, X, Home, Briefcase, Navigation, Map 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface Address {
  _id?: string;
  name: string;
  houseNumber: string;
  street: string;
  landmark: string;
  area: string;
  city: string;
  pincode: string;
}

const initialAddressState: Address = {
  name: '', houseNumber: '', street: '', landmark: '', area: '', city: '', pincode: '',
};

interface AddressFormProps {
  address: Address;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const AddressForm = ({ address, handleSubmit, handleInputChange, onCancel, isEditing = false }: AddressFormProps) => (
  <div className="relative mb-10 animate-in fade-in zoom-in duration-500">
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-[2rem] blur opacity-25"></div>
    <form 
      onSubmit={handleSubmit} 
      className="relative bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-xl shadow-blue-500/5"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isEditing ? 'Refine Address' : 'New Destination'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">Please ensure all details are accurate for seamless delivery.</p>
        </div>
        <button 
          type="button" 
          onClick={onCancel} 
          className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-300"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Address Label</label>
          <input 
            type="text" name="name" value={address.name} onChange={handleInputChange} required 
            className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all duration-300 text-slate-700 placeholder:text-slate-300" 
            placeholder="e.g. My Penthouse, Office HQ" 
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Flat / House No.</label>
            <input type="text" name="houseNumber" value={address.houseNumber} onChange={handleInputChange} required 
              className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all duration-300 text-slate-700" 
              placeholder="102-B" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Street / Locality</label>
            <input type="text" name="street" value={address.street} onChange={handleInputChange} required 
              className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all duration-300 text-slate-700" 
              placeholder="Sunset Boulevard" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Landmark</label>
            <input type="text" name="landmark" value={address.landmark} onChange={handleInputChange}
              className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all duration-300 text-slate-700" 
              placeholder="Near the old oak tree" 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Area / Suburb</label>
            <input type="text" name="area" value={address.area} onChange={handleInputChange} required 
              className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all duration-300 text-slate-700" 
              placeholder="Hills District" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">City</label>
            <input type="text" name="city" value={address.city} onChange={handleInputChange} required 
              className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all duration-300 text-slate-700" 
              placeholder="New York" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Pincode</label>
            <input type="text" name="pincode" value={address.pincode} onChange={handleInputChange} required 
              className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all duration-300 text-slate-700" 
              placeholder="10001" 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-10">
        <button 
          type="submit" 
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all duration-300 active:scale-[0.98]"
        >
          <Save size={20} />
          {isEditing ? 'Confirm Updates' : 'Secure Address'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
);

export default function Addresses() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>(initialAddressState);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/users/addresses`, { withCredentials: true });
      setAddresses(response.data);
    } catch (error) {
      toast.error("Could not load addresses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else {
      setAddresses(user.addresses || []);
      fetchAddresses();
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress(prevState => ({ ...prevState, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData(prevState => ({ ...prevState!, [name]: value }));
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/users/addresses`, newAddress, { withCredentials: true });
      setAddresses(response.data);
      toast.success("Address secured!");
      setIsFormVisible(false);
      setNewAddress(initialAddressState);
    } catch (error) {
      toast.error("Failed to save address.");
    }
  };
  
  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !editingAddressId) return;
    try {
      const response = await axios.put(`${API_URL}/api/users/addresses/${editingAddressId}`, editFormData, { withCredentials: true });
      setAddresses(response.data);
      toast.success("Details updated.");
      setEditingAddressId(null);
      setEditFormData(null);
    } catch (error) {
      toast.error("Failed to update address.");
    }
  };
  
  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Permanent delete? This cannot be undone.")) return;
    try {
      const response = await axios.delete(`${API_URL}/api/users/addresses/${addressId}`, { withCredentials: true });
      setAddresses(response.data);
      toast.success("Address removed.");
    } catch (error) {
      toast.error("Failed to delete address.");
    }
  };
  
  const startEditing = (address: Address) => {
    setEditingAddressId(address._id!);
    setEditFormData({ ...address });
    setIsFormVisible(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const cancelEditing = () => {
    setEditingAddressId(null);
    setEditFormData(null);
  };

  // Icon Helper for Address Labels
  const getAddressIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('home')) return <Home size={18} />;
    if (lower.includes('office') || lower.includes('work')) return <Briefcase size={18} />;
    return <MapPin size={18} />;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-3xl opacity-60"></div>

        <main className="container mx-auto px-6 py-12 max-w-6xl">
          
          <button 
            onClick={() => navigate("/account")} 
            className="group flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all duration-300 mb-10"
          >
            <div className="p-2 bg-slate-50 group-hover:bg-blue-50 rounded-full transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest">Dashboard</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">My Addresses</h1>
              <p className="text-slate-500 mt-2 text-lg">Manage your premier delivery locations.</p>
            </div>
            {!isFormVisible && !editingAddressId && (
              <button 
                onClick={() => setIsFormVisible(true)} 
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all duration-300 active:scale-95"
              >
                <Plus size={20} strokeWidth={3} />
                Add New
              </button>
            )}
          </div>

          {isFormVisible && (
            <AddressForm 
              address={newAddress} 
              handleSubmit={handleSaveAddress} 
              handleInputChange={handleInputChange} 
              onCancel={() => setIsFormVisible(false)} 
            />
          )}

          {editingAddressId && editFormData && (
            <AddressForm 
              address={editFormData} 
              handleSubmit={handleUpdateAddress} 
              handleInputChange={handleEditInputChange} 
              onCancel={cancelEditing} 
              isEditing={true} 
            />
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-[3rem] border border-slate-100">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Locations...</p>
            </div>
          ) : addresses.length === 0 && !isFormVisible && !editingAddressId ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
              <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                <Map size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Your map is empty</h3>
              <p className="text-slate-500 mt-2 mb-10 max-w-md mx-auto">Store multiple addresses to enjoy faster checkouts and precise deliveries.</p>
              <button 
                onClick={() => setIsFormVisible(true)} 
                className="px-10 py-4 border-2 border-blue-600 text-blue-600 font-bold rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {addresses.map(address => {
                if (editingAddressId === address._id) return null;
                return (
                  <div 
                    key={address._id} 
                    className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                  >
                    {/* Subtle Background Pattern */}
                    <div className="absolute -right-4 -top-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <Navigation size={120} />
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                          {getAddressIcon(address.name)}
                        </div>
                        <span className="font-black text-slate-800 uppercase tracking-widest text-sm">{address.name}</span>
                      </div>

                      <div className="space-y-1 text-slate-600">
                        <p className="font-bold text-slate-900 text-lg">{address.houseNumber}, {address.street}</p>
                        <p className="text-sm">{address.area}</p>
                        <p className="text-sm">{address.city} - {address.pincode}</p>
                        {address.landmark && (
                          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400 font-medium italic">
                            <Navigation size={12} />
                            Near {address.landmark}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-50">
                        <button 
                          onClick={() => startEditing(address)} 
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300"
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(address._id!)} 
                          className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all duration-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}