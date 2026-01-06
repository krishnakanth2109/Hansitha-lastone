// src/pages/Checkout.tsx (Corrected and Complete)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Save, PlusCircle, Edit, Trash2, Home, Check, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const initialAddressState = { 
  name: '', 
  houseNumber: '', 
  street: '', 
  landmark: '', 
  area: '', 
  city: '', 
  pincode: '' 
};

const Checkout: React.FC = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isFetchingLocation, setIsFetchingLocation] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');

  // State for forms
  const [newAddress, setNewAddress] = useState(initialAddressState);
  const [editAddress, setEditAddress] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "Please log in to proceed.", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (user?.addresses && user.addresses.length > 0) {
      setShippingAddress(user.addresses[0]);
      setView('list');
    } else if (user) {
      setView('add');
    }
  }, [user, authLoading, navigate, toast]);

  // --- START: NEW FUNCTION FOR GETTING CUSTOMER LOCATION ---
  // This is the function you added, now placed correctly inside the component.
  const handleFetchLocation = async () => {
    if (!navigator.geolocation) {
        toast({ title: "Geolocation is not supported by your browser.", variant: "destructive" });
        return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await axios.post(
                    `${API_URL}/api/geocode/reverse`,
                    { lat: latitude, lng: longitude },
                    { withCredentials: true }
                );

                const fetchedAddress = res.data;
                
                // Pre-fill the 'add new address' form with the fetched data
                setNewAddress(prevState => ({
                    ...prevState,
                    ...fetchedAddress,
                    name: prevState.name || 'My Location', // Give it a default name
                }));

                // Automatically switch to the add form view
                setView('add');
                toast({ title: "Location found!", description: "Please review and save your address." });

            } catch (error) {
                toast({ title: "Could not fetch address", description: "Please enter your address manually.", variant: "destructive" });
            } finally {
                setIsFetchingLocation(false);
            }
        },
        (error) => {
            toast({ title: "Location Error", description: error.message, variant: "destructive" });
            setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true }
    );
  };
  // --- END: NEW FUNCTION FOR GETTING CUSTOMER LOCATION ---

  // Address Management Functions
  const handleSaveNewAddress = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/api/users/addresses`, newAddress, { withCredentials: true });
      const updatedAddresses = response.data;
      updateUser({ addresses: updatedAddresses });
      setShippingAddress(updatedAddresses[updatedAddresses.length - 1]);
      setView('list');
      setNewAddress(initialAddressState);
      toast({ title: "Success", description: "New address saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save address.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditClick = (address: any) => {
    setEditAddress(address);
    setView('edit');
  };
  
  const handleUpdateAddress = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL}/api/users/addresses/${editAddress._id}`, editAddress, { withCredentials: true });
      const updatedAddresses = response.data;
      updateUser({ addresses: updatedAddresses });
      if(shippingAddress?._id === editAddress._id) {
        setShippingAddress(editAddress);
      }
      setView('list');
      setEditAddress(null);
      toast({ title: "Success", description: "Address updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update address.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setIsProcessing(true);
    try {
      const response = await axios.delete(`${API_URL}/api/users/addresses/${addressId}`, { withCredentials: true });
      const updatedAddresses = response.data;
      updateUser({ addresses: updatedAddresses });
      if(shippingAddress?._id === addressId) {
        setShippingAddress(updatedAddresses.length > 0 ? updatedAddresses[0] : null);
      }
      if (updatedAddresses.length === 0) setView('add');
      toast({ title: "Success", description: "Address deleted." });
    } catch(error) {
      toast({ title: "Error", description: "Failed to delete address.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Main Checkout Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress) {
      toast({ title: "No Shipping Address", description: "Please add and select an address.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const payload = { user: { id: user!._id, email: user!.email }, address: shippingAddress, cartItems, totalAmount: total };
      const res = await axios.post(`${API_URL}/api/checkout/payment-link`, payload, { withCredentials: true });
      const paymentLink = res.data.paymentLink.short_url;
      /* await clearCart(); */
      window.location.href = paymentLink;
    } catch (err: any) {
      toast({ title: "Checkout Error", description: err.response?.data?.error || "Failed to initiate payment.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = getTotalPrice();
  const total = subtotal + (subtotal * 0.10);
  const uniqueCartItems = [...new Map(cartItems.map(item => [item.id, item])).values()];

  if (authLoading) return <div className="text-center p-10">Loading...</div>;

  // Render Logic
  const renderShippingContent = () => {
    if (view === 'add') {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Add a New Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={newAddress.name} 
                onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} 
                placeholder="Full Name" 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="houseNumber">H.No / Flat No.</Label>
              <Input 
                id="houseNumber" 
                name="houseNumber" 
                value={newAddress.houseNumber} 
                onChange={(e) => setNewAddress({...newAddress, houseNumber: e.target.value})} 
                placeholder="H.No / Flat No." 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Street / Colony</Label>
              <Input 
                id="street" 
                name="street" 
                value={newAddress.street} 
                onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} 
                placeholder="Street / Colony" 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input 
                id="landmark" 
                name="landmark" 
                value={newAddress.landmark} 
                onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})} 
                placeholder="Landmark (Optional)" 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input 
                id="area" 
                name="area" 
                value={newAddress.area} 
                onChange={(e) => setNewAddress({...newAddress, area: e.target.value})} 
                placeholder="Area" 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                name="city" 
                value={newAddress.city} 
                onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} 
                placeholder="City" 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input 
                id="pincode" 
                name="pincode" 
                value={newAddress.pincode} 
                onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} 
                placeholder="Pincode" 
                maxLength={6} 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={handleSaveNewAddress} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            {user?.addresses && user.addresses.length > 0 && (
              <Button type="button" variant="outline" onClick={() => setView('list')}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (view === 'edit' && editAddress) {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Edit Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input 
                id="edit-name"
                value={editAddress.name} 
                onChange={(e) => setEditAddress({...editAddress, name: e.target.value})} 
                placeholder="Full Name" 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-houseNumber">H.No / Flat No.</Label>
              <Input 
                id="edit-houseNumber"
                value={editAddress.houseNumber} 
                onChange={(e) => setEditAddress({...editAddress, houseNumber: e.target.value})} 
                placeholder="H.No / Flat No." 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-street">Street / Colony</Label>
              <Input 
                id="edit-street"
                value={editAddress.street} 
                onChange={(e) => setEditAddress({...editAddress, street: e.target.value})} 
                placeholder="Street / Colony" 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-landmark">Landmark (Optional)</Label>
              <Input 
                id="edit-landmark"
                value={editAddress.landmark} 
                onChange={(e) => setEditAddress({...editAddress, landmark: e.target.value})} 
                placeholder="Landmark (Optional)" 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-area">Area</Label>
              <Input 
                id="edit-area"
                value={editAddress.area} 
                onChange={(e) => setEditAddress({...editAddress, area: e.target.value})} 
                placeholder="Area" 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input 
                id="edit-city"
                value={editAddress.city} 
                onChange={(e) => setEditAddress({...editAddress, city: e.target.value})} 
                placeholder="City" 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pincode">Pincode</Label>
              <Input 
                id="edit-pincode"
                value={editAddress.pincode} 
                onChange={(e) => setEditAddress({...editAddress, pincode: e.target.value})} 
                placeholder="Pincode" 
                maxLength={6} 
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={handleUpdateAddress} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Update
            </Button>
            <Button type="button" variant="outline" onClick={() => setView('list')}>
              Cancel
            </Button>
          </div>
        </div>
      );
    }
    
    // Default view: list of addresses - IMPROVED ALIGNMENT
    if (view === 'list') {
      return (
        <div className="space-y-4">
          
          {/* --- START: NEW BUTTON INTEGRATION --- */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={handleFetchLocation}
            disabled={isFetchingLocation}
          >
            {isFetchingLocation ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            Use My Current Location to Fill Form
          </Button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t"></div>
            <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR SELECT A SAVED ADDRESS</span>
            <div className="flex-grow border-t"></div>
          </div>
          {/* --- END: NEW BUTTON INTEGRATION --- */}

          <RadioGroup value={shippingAddress?._id} onValueChange={(value) => {
            const selected = user?.addresses?.find(addr => addr._id === value);
            if (selected) setShippingAddress(selected);
          }}>
            {user?.addresses?.map((address) => (
              <div 
                key={address._id} 
                className={`p-4 border rounded-lg transition-all ${
                  shippingAddress?._id === address._id 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <RadioGroupItem 
                      value={address._id} 
                      id={address._id} 
                      className="mt-1 flex-shrink-0" 
                    />
                    <label 
                      htmlFor={address._id} 
                      className="flex-1 text-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-gray-500" />
                        <p className="font-bold text-gray-900">{address.name}</p>
                        {shippingAddress?._id === address._id && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900">{address.houseNumber}, {address.street}</p>
                      {address.landmark && <p className="text-gray-600 text-sm">Near {address.landmark}</p>}
                      <p className="text-gray-600">{address.area}, {address.city}, {address.pincode}</p>
                    </label>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(address)} 
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                        title="Edit address"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAddress(address._id)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full border-dashed hover:border-solid hover:bg-gray-50" 
            onClick={() => setView('add')}
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Add a New Address Manually
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" /> Shipping Details
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderShippingContent()}</CardContent>
              </Card>
            </div>
            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uniqueCartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg"/>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (10%)</span>
                        <span className="text-gray-900">₹{(subtotal * 0.10).toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-black text-white hover:bg-gray-900 mt-4" 
                      disabled={isProcessing || !shippingAddress || view !== 'list'}
                    >
                      {isProcessing ? "Processing..." : <><Lock className="w-4 h-4 mr-2" /> Place Order</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;