// src/pages/Checkout.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User, Lock, Save, PlusCircle, Edit, Trash2,
  Home, Check, MapPin, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";

// ✅ NOTE: No Razorpay keys on the frontend.
// The frontend only calls our own backend /api/payment/payment-link
// The backend has RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in its .env
const API_URL = import.meta.env.VITE_API_URL;

const initialAddressState = {
  name: '', houseNumber: '', street: '', landmark: '', area: '', city: '', pincode: ''
};

const Checkout: React.FC = () => {
  const { cartItems, getTotalPrice } = useCart(); 
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isFetchingLocation, setIsFetchingLocation] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [newAddress, setNewAddress] = useState(initialAddressState);
  const [editAddress, setEditAddress] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const validateAddress = (address: any) => {
    const errs: Record<string, string> = {};
    if (!address.name?.trim()) errs.name = "Full Name is required.";
    else if (address.name.trim().length < 3) errs.name = "Name must be at least 3 characters.";
    if (!address.houseNumber?.trim()) errs.houseNumber = "House/Flat No. is required.";
    if (!address.street?.trim()) errs.street = "Street/Colony is required.";
    if (!address.area?.trim()) errs.area = "Area is required.";
    if (!address.city?.trim()) errs.city = "City is required.";
    if (!address.pincode?.trim()) errs.pincode = "Pincode is required.";
    else if (!/^\d{6}$/.test(address.pincode)) errs.pincode = "Pincode must be exactly 6 digits.";
    return { isValid: Object.keys(errs).length === 0, errors: errs };
  };

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'name' || name === 'city') value = value.replace(/[^a-zA-Z\s]/g, '');
    if (name === 'pincode') value = value.replace(/\D/g, '').slice(0, 6);
    setNewAddress(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEditAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'name' || name === 'city') value = value.replace(/[^a-zA-Z\s]/g, '');
    if (name === 'pincode') value = value.replace(/\D/g, '').slice(0, 6);
    setEditAddress((prev: any) => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const resetViewsAndErrors = (targetView: 'list' | 'add' | 'edit') => {
    setFormErrors({});
    setView(targetView);
  };

  const handleFetchLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported.", variant: "destructive" });
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
          setNewAddress(prev => ({ ...prev, ...res.data, name: prev.name || 'My Location' }));
          resetViewsAndErrors('add');
          toast({ title: "Location found!", description: "Please review and save your address." });
        } catch {
          toast({ title: "Could not fetch address", description: "Please enter manually.", variant: "destructive" });
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error: any) => {
        toast({ title: "Location Error", description: error.message, variant: "destructive" });
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSaveNewAddress = async () => {
    const { isValid, errors } = validateAddress(newAddress);
    if (!isValid) {
      setFormErrors(errors);
      toast({ title: "Validation Error", description: "Please fix the highlighted errors.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/api/users/addresses`, newAddress, { withCredentials: true });
      const updatedAddresses = response.data;
      updateUser({ addresses: updatedAddresses });
      setShippingAddress(updatedAddresses[updatedAddresses.length - 1]);
      resetViewsAndErrors('list');
      setNewAddress(initialAddressState);
      toast({ title: "Success", description: "New address saved." });
    } catch {
      toast({ title: "Error", description: "Failed to save address.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditClick = (address: any) => {
    setEditAddress(address);
    resetViewsAndErrors('edit');
  };
  
  const handleUpdateAddress = async () => {
    const { isValid, errors } = validateAddress(editAddress);
    if (!isValid) {
      setFormErrors(errors);
      toast({ title: "Validation Error", description: "Please fix the highlighted errors.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/users/addresses/${editAddress._id}`,
        editAddress,
        { withCredentials: true }
      );
      const updatedAddresses = response.data;
      updateUser({ addresses: updatedAddresses });
      if (shippingAddress?._id === editAddress._id) setShippingAddress(editAddress);
      resetViewsAndErrors('list');
      setEditAddress(null);
      toast({ title: "Success", description: "Address updated." });
    } catch {
      toast({ title: "Error", description: "Failed to update address.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setIsProcessing(true);
    try {
      const response = await axios.delete(
        `${API_URL}/api/users/addresses/${addressId}`,
        { withCredentials: true }
      );
      const updatedAddresses = response.data;
      updateUser({ addresses: updatedAddresses });
      if (shippingAddress?._id === addressId) {
        setShippingAddress(updatedAddresses.length > 0 ? updatedAddresses[0] : null);
      }
      if (updatedAddresses.length === 0) resetViewsAndErrors('add');
      toast({ title: "Success", description: "Address deleted." });
    } catch {
      toast({ title: "Error", description: "Failed to delete address.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = getTotalPrice();
  const total = subtotal + subtotal * 0.10;
  const uniqueCartItems = [...new Map(cartItems.map(item => [item.id, item])).values()];

  // =====================================================
  // ✅ FIXED handleSubmit — 3 bugs corrected:
  //
  // BUG 1 (was): endpoint /api/checkout/payment-link
  //              → hit checkoutRoutes.js which had a duplicate crashing route
  // FIX:         endpoint /api/payment/payment-link (payment.js, has auth)
  //
  // BUG 2 (was): payload key `user: { id, email, name }`
  //              → backend reads req.body.customer, not req.body.user
  // FIX:         payload key `customer: { id, email, name }`
  //
  // BUG 3 (was): reads res.data?.paymentLink?.short_url  → undefined
  // FIX:         reads res.data?.url  (what payment.js actually returns)
  //
  // After payment: Razorpay redirects to /track-order/:orderId (set in payment.js)
  // =====================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingAddress) {
      toast({ title: "No Shipping Address", description: "Please add and select an address.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: "Empty Cart", description: "Add items before checking out.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        // ✅ FIX: key is 'customer', not 'user'
        customer: {
          id: user._id || (user as any).id,
          email: user.email,
          name: user.name,
        },
        email: user.email,
        address: shippingAddress,
        cartItems,
        totalAmount: total,
      };

      console.log("🛒 [Checkout] Sending payload to /api/payment/payment-link");

      // ✅ FIX: correct endpoint
      const res = await axios.post(
        `${API_URL}/api/payment/payment-link`,
        payload,
        { withCredentials: true }
      );

      console.log("✅ [Checkout] Response:", res.data);

      // ✅ FIX: correct field — res.data.url (not res.data.paymentLink.short_url)
      if (res.data?.url) {
        // Redirect to Razorpay. After payment Razorpay sends user to:
        //   /track-order/:orderId  (set as callback_url in payment.js)
        window.location.href = res.data.url;
      } else {
        throw new Error("Payment link URL not received from server");
      }

    } catch (err: any) {
      console.error("❌ [Checkout] Error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to initiate payment. Please try again.";
      toast({ title: "Checkout Error", description: errMsg, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) return <div className="text-center p-10">Loading...</div>;

  const renderShippingContent = () => {
    if (view === 'add') {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900">Add a New Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900">Full Name</Label>
              <Input id="name" name="name" value={newAddress.name} onChange={handleNewAddressChange} placeholder="Full Name"
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="houseNumber" className="text-gray-900">H.No / Flat No.</Label>
              <Input id="houseNumber" name="houseNumber" value={newAddress.houseNumber} onChange={handleNewAddressChange} placeholder="H.No / Flat No."
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.houseNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.houseNumber && <p className="text-red-500 text-xs mt-1">{formErrors.houseNumber}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street" className="text-gray-900">Street / Colony</Label>
              <Input id="street" name="street" value={newAddress.street} onChange={handleNewAddressChange} placeholder="Street / Colony"
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.street ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="landmark" className="text-gray-900">Landmark (Optional)</Label>
              <Input id="landmark" name="landmark" value={newAddress.landmark} onChange={handleNewAddressChange} placeholder="Landmark (Optional)"
                className="focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area" className="text-gray-900">Area</Label>
              <Input id="area" name="area" value={newAddress.area} onChange={handleNewAddressChange} placeholder="Area"
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.area ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.area && <p className="text-red-500 text-xs mt-1">{formErrors.area}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-gray-900">City</Label>
              <Input id="city" name="city" value={newAddress.city} onChange={handleNewAddressChange} placeholder="City"
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode" className="text-gray-900">Pincode</Label>
              <Input id="pincode" name="pincode" value={newAddress.pincode} onChange={handleNewAddressChange} placeholder="Pincode" maxLength={6}
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.pincode ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.pincode && <p className="text-red-500 text-xs mt-1">{formErrors.pincode}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={handleSaveNewAddress} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            {user?.addresses && user.addresses.length > 0 && (
              <Button type="button" variant="outline" onClick={() => resetViewsAndErrors('list')} className="bg-white text-gray-900 border-gray-200">
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
          <h3 className="font-semibold text-lg text-gray-900">Edit Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-900">Full Name</Label>
              <Input name="name" value={editAddress.name} onChange={handleEditAddressChange} placeholder="Full Name"
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.name ? 'border-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.name && <p className="text-red-500 text-xs">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">H.No / Flat No.</Label>
              <Input name="houseNumber" value={editAddress.houseNumber} onChange={handleEditAddressChange} placeholder="H.No / Flat No."
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.houseNumber ? 'border-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.houseNumber && <p className="text-red-500 text-xs">{formErrors.houseNumber}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-gray-900">Street / Colony</Label>
              <Input name="street" value={editAddress.street} onChange={handleEditAddressChange} placeholder="Street / Colony"
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.street ? 'border-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.street && <p className="text-red-500 text-xs">{formErrors.street}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-gray-900">Landmark (Optional)</Label>
              <Input name="landmark" value={editAddress.landmark} onChange={handleEditAddressChange} placeholder="Landmark (Optional)"
                className="bg-white text-gray-900 border-gray-200 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">Area</Label>
              <Input name="area" value={editAddress.area} onChange={handleEditAddressChange} placeholder="Area"
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.area ? 'border-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.area && <p className="text-red-500 text-xs">{formErrors.area}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">City</Label>
              <Input name="city" value={editAddress.city} onChange={handleEditAddressChange} placeholder="City"
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.city ? 'border-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.city && <p className="text-red-500 text-xs">{formErrors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">Pincode</Label>
              <Input name="pincode" value={editAddress.pincode} onChange={handleEditAddressChange} placeholder="Pincode" maxLength={6}
                className={`bg-white text-gray-900 focus:ring-2 ${formErrors.pincode ? 'border-red-500' : 'border-gray-200 focus:ring-blue-500'}`} />
              {formErrors.pincode && <p className="text-red-500 text-xs">{formErrors.pincode}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={handleUpdateAddress} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" /> Update
            </Button>
            <Button type="button" variant="outline" onClick={() => resetViewsAndErrors('list')} className="bg-white text-gray-900 border-gray-200">
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    // Address list
    if (view === 'list') {
      return (
        <div className="space-y-4">
          <Button type="button" variant="outline"
            className="w-full border-dashed bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
            onClick={handleFetchLocation} disabled={isFetchingLocation}>
            {isFetchingLocation
              ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              : <MapPin className="w-4 h-4 mr-2" />}
            Use My Current Location to Fill Form
          </Button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink mx-4 text-xs text-gray-500">OR SELECT A SAVED ADDRESS</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <RadioGroup value={shippingAddress?._id} onValueChange={(value) => {
            const selected = user?.addresses?.find((addr: any) => addr._id === value);
            if (selected) setShippingAddress(selected);
          }}>
            {user?.addresses?.map((address: any) => (
              <div key={address._id}
                className={`p-4 border rounded-lg transition-all bg-white ${
                  shippingAddress?._id === address._id
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <RadioGroupItem value={address._id} id={address._id} className="mt-1 flex-shrink-0" />
                    <label htmlFor={address._id} className="flex-1 text-sm cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-gray-500" />
                        <p className="font-bold text-gray-900">{address.name}</p>
                        {shippingAddress?._id === address._id && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Check className="w-3 h-3 mr-1" /> Selected
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900">{address.houseNumber}, {address.street}</p>
                      {address.landmark && <p className="text-gray-600 text-sm">Near {address.landmark}</p>}
                      <p className="text-gray-600">{address.area}, {address.city}, {address.pincode}</p>
                    </label>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => handleEditClick(address)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-gray-100">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => handleDeleteAddress(address._id)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-gray-100">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
          
          <Button type="button" variant="outline"
            className="w-full border-dashed hover:border-solid hover:bg-gray-50 bg-white text-gray-900 border-gray-300"
            onClick={() => resetViewsAndErrors('add')}>
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
          <h1 className="text-3xl font-bold text-white drop-shadow-md mb-8">Checkout</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card className="bg-white border-none shadow-lg">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <User className="w-5 h-5 text-gray-700" /> Shipping Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">{renderShippingContent()}</CardContent>
              </Card>
            </div>
            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card className="bg-white border-none shadow-lg">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="text-gray-900">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {uniqueCartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <Separator className="bg-gray-200" />
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
                      <Separator className="bg-gray-200" />
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
                      {isProcessing
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting to Payment...</>
                        : <><Lock className="w-4 h-4 mr-2" /> Place Order</>
                      }
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-2">
                      You'll be redirected to Razorpay's secure payment page
                    </p>
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