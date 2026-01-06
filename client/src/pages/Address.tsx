import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trash2, PlusCircle, Loader2, Edit, Save } from 'lucide-react';

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

// Define props for the reusable form to prevent bugs
interface AddressFormProps {
  address: Address;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

// A reusable form component for both adding and editing
const AddressForm = ({ address, handleSubmit, handleInputChange, onCancel, isEditing = false }: AddressFormProps) => (
  <form onSubmit={handleSubmit} className="p-4 mb-6 border rounded-lg bg-gray-50 space-y-4">
    <h2 className="text-xl font-semibold text-gray-700">{isEditing ? 'Edit Address' : 'Add a New Address'}</h2>
    <input type="text" name="name" value={address.name} onChange={handleInputChange} placeholder="Address Name (e.g., Home)" required className="w-full p-2 border rounded" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="text" name="houseNumber" value={address.houseNumber} onChange={handleInputChange} placeholder="H.No / Flat No." required className="w-full p-2 border rounded" />
      <input type="text" name="street" value={address.street} onChange={handleInputChange} placeholder="Street / Colony" required className="w-full p-2 border rounded" />
      <input type="text" name="landmark" value={address.landmark} onChange={handleInputChange} placeholder="Landmark" className="w-full p-2 border rounded" />
      <input type="text" name="area" value={address.area} onChange={handleInputChange} placeholder="Area" required className="w-full p-2 border rounded" />
      <input type="text" name="city" value={address.city} onChange={handleInputChange} placeholder="City" required className="w-full p-2 border rounded" />
      <input type="text" name="pincode" value={address.pincode} onChange={handleInputChange} placeholder="Pincode" required className="w-full p-2 border rounded" />
    </div>
    <div className="flex gap-4">
      <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          <Save size={18}/> Save Address
      </button>
      <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
    </div>
  </form>
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
      toast.success("Address saved!");
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
      toast.success("Address updated!");
      setEditingAddressId(null);
      setEditFormData(null);
    } catch (error) {
      toast.error("Failed to update address.");
    }
  };
  
  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await axios.delete(`${API_URL}/api/users/addresses/${addressId}`, { withCredentials: true });
      setAddresses(response.data);
      toast.success("Address deleted.");
    } catch (error) {
      toast.error("Failed to delete address.");
    }
  };
  
  const startEditing = (address: Address) => {
    setEditingAddressId(address._id!);
    setEditFormData({ ...address });
    setIsFormVisible(false);
  };
  
  const cancelEditing = () => {
    setEditingAddressId(null);
    setEditFormData(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate("/account")} className="mb-6 text-blue-600 hover:text-blue-800 font-medium">
              &larr; Back to Account
            </button>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800">My Addresses</h1>
                {!isFormVisible && !editingAddressId && (
                   <button onClick={() => setIsFormVisible(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      <PlusCircle size={20} /> Add New
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

              {isLoading ? (
                <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin mr-2" /> Loading addresses...</div>
              ) : addresses.length === 0 && !isFormVisible && !editingAddressId ? (
                <div className="text-center text-gray-500 py-8">
                  You haven't saved any addresses yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map(address => (
                    <div key={address._id}>
                      {editingAddressId === address._id ? (
                        <AddressForm 
                          address={editFormData!} 
                          handleSubmit={handleUpdateAddress} 
                          handleInputChange={handleEditInputChange} 
                          onCancel={cancelEditing} 
                          isEditing={true} 
                        />
                      ) : (
                        <div className="p-4 border rounded-lg shadow-sm flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg">{address.name}</p>
                            <p className="text-gray-700">{address.houseNumber}, {address.street},</p>
                            <p className="text-gray-700">{address.area}, {address.landmark},</p>
                            <p className="text-gray-700">{address.city} - {address.pincode}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => startEditing(address)} className="text-blue-500 hover:text-blue-700 p-2">
                                <Edit size={20} />
                            </button>
                            <button onClick={() => handleDeleteAddress(address._id!)} className="text-red-500 hover:text-red-700 p-2">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}