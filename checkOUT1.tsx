import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { calculatePricing } from "../utils/pricing";
import { TruckButton } from "../components/TruckButton";

// ADDED: Import the currency hook to make prices dynamic
import { useCurrency } from "../context/CurrencyContext";

const API_URL = import.meta.env.VITE_API_URL;

const Checkout: React.FC = () => {
  // ADDED: Get the dynamic formatPrice function from the context
  const { formatPrice } = useCurrency();

  const { cartItems, getTotalPrice } = useCart();
  const { reloadProducts } = useProducts();
  reloadProducts();

  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [animateTruck, setAnimateTruck] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form fields
  const validateForm = () => {
    const requiredFields = [
      "email",
      "firstName",
      "lastName",
      "phone",
      "address1",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.trim()) {
        toast({
          title: "Error",
          description: `Please fill in the ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} field.`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  // Form valid check for button disabling
  const isFormValid = useMemo(() => {
    const requiredFields = [
      "email",
      "firstName",
      "lastName",
      "phone",
      "address1",
      "city",
      "state",
      "postalCode",
      "country",
    ];
    return requiredFields.every(
      (field) => formData[field as keyof typeof formData].trim() !== ""
    );
  }, [formData]);

  // Calculate subtotal
  const subtotal = getTotalPrice();

  // Redirect to cart if empty
  useEffect(() => {
    if (subtotal === 0) {
      navigate("/cart");
    }
  }, [subtotal, navigate]);

  const { shipping, tax, total } = calculatePricing(subtotal);

  // Handle checkout
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setAnimateTruck(true);
    setIsProcessing(true);

    try {
      const {
        email,
        firstName,
        lastName,
        phone,
        address1,
        address2,
        city,
        state,
        postalCode,
        country,
      } = formData;

      // Generate Razorpay payment link
      const res = await axios.post(`${API_URL}/api/payment-link`, {
        totalAmount: total,
        cartItems,
        userName: `${firstName} ${lastName}`,
        userEmail: email,
        userPhone: phone,
        shippingAddress: {
          address1,
          address2,
          city,
          state,
          postalCode,
          country,
        },
      });

      const link = res.data.paymentLink.short_url;

      // Play truck animation briefly
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to payment page
      window.location.href = link;
    } catch (err) {
      console.error("Error generating payment link:", err);
      toast({
        title: "Error",
        description: "Failed to generate payment link. Please try again.",
        variant: "destructive",
      });
      setAnimateTruck(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact + Shipping Forms */}
            <div className="space-y-6">
              <CheckoutSection
                icon={<User className="w-5 h-5" />}
                title="Contact Information"
                fields={[
                  { id: "email", label: "Email Address" },
                  { id: "firstName", label: "First Name" },
                  { id: "lastName", label: "Last Name" },
                  { id: "phone", label: "Phone Number", maxLength: 10 },
                ]}
                formData={formData}
                handleChange={handleInputChange}
              />

              <CheckoutSection
                icon={<User className="w-5 h-5" />}
                title="Shipping Address"
                fields={[
                  { id: "address1", label: "Address Line 1" },
                  { id: "address2", label: "Address Line 2 (Optional)" },
                  { id: "city", label: "City" },
                  { id: "state", label: "State / Province" },
                  { id: "postalCode", label: "Postal Code" },
                  { id: "country", label: "Country" },
                ]}
                formData={formData}
                handleChange={handleInputChange}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        </div>
                        {/* CHANGED: This now uses the dynamic formatPrice */}
                        <p className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2 text-sm">
                      {/* CHANGED: Using dynamic formatPrice for all summary rows */}
                      <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
                      <SummaryRow label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping)} />
                      <SummaryRow label="Tax" value={formatPrice(tax)} />
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        {/* CHANGED: Using dynamic formatPrice for the final total */}
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>

                    {/* Truck Button */}
                    <div className="mt-6 flex justify-center">
                      <TruckButton
                        type="submit"
                        disabled={!isFormValid || isProcessing}
                        animate={animateTruck}
                      />
                    </div>

                    <p className="text-sm text-center text-gray-600 flex items-center justify-center gap-1 mt-2">
                      <Lock className="w-3 h-3" /> Your order details are safe and secure.
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

// --------------------------
// Reusable Components
// --------------------------

const InputGroup = ({
  id,
  label,
  value,
  onChange,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} name={id} value={value} onChange={onChange} maxLength={maxLength} />
  </div>
);

// CHANGED: This component now accepts a string for the value to handle "Free" shipping and pre-formatted prices.
const SummaryRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const CheckoutSection = ({
  icon,
  title,
  fields,
  formData,
  handleChange,
}: {
  icon: React.ReactNode;
  title: string;
  fields: { id: string; label: string; maxLength?: number }[];
  formData: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon} {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {fields.map((field) => (
        <InputGroup
          key={field.id}
          id={field.id}
          label={field.label}
          value={formData[field.id]}
          onChange={handleChange}
          maxLength={field.maxLength}
        />
      ))}
    </CardContent>
  </Card>
);