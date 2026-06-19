/*
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { useCurrency } from "../context/CurrencyContext";
import { calculatePricing } from "../utils/pricing";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // if you don't have this, swap for <Input>
import { Checkbox } from "@/components/ui/checkbox"; // if you don't have this, use a native input
import { useToast } from "@/hooks/use-toast";
import { User, Lock, ArrowRight, ShieldCheck, Info, AlertTriangle } from "lucide-react";
import axios from "axios";

// -----------------------------------------------------------------------------
// CONFIG FLAGS
// -----------------------------------------------------------------------------
const SEND_SHIPPING_TO_BACKEND = false; // ← Set to true only if your backend expects shippingAddress.
const ENABLE_DEBUG_PANEL = true;        // ← Toggle to show/hide debug panel in dev builds.

// -----------------------------------------------------------------------------
// ENV
// -----------------------------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL;

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------
type CartItem = {
  id: string | number;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  [key: string]: any;
};

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
  acceptTerms: boolean;
  promoCode: string;
};

type ServerPaymentResponse = {
  paymentLink?: {
    short_url?: string;
    [k: string]: any;
  };
  error?: string;
  [k: string]: any;
};

// -----------------------------------------------------------------------------
// SMALL HELPERS
// -----------------------------------------------------------------------------
const phoneRegex = /^[6-9]\d{9}$/; // basic Indian mobile format: 10 digits, starts 6-9
const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const assertApiUrl = () => {
  if (!API_URL) {
    throw new Error(
      "VITE_API_URL is not defined. Please set it in your .env file (e.g., http://localhost:5000)"
    );
  }
};

const safeNumber = (n: number): number => (Number.isFinite(n) ? n : 0);

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  // bring back clearCart per old behavior
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { reloadProducts } = useProducts();

  // local UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // form state
  const [formData, setFormData] = useState<FormData>({
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
    notes: "",
    acceptTerms: false,
    promoCode: "",
  });

  // Load products on mount (like your new version)
  useEffect(() => {
    reloadProducts();
  }, [reloadProducts]);

  // Handle field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    // number-ish fields remain strings here; server expects strings except total
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Checkbox handler (shadcn/ui checkbox uses checked boolean prop)
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((s) => ({ ...s, acceptTerms: checked }));
  };

  // Subtotal and derived pricing
  const subtotal = getTotalPrice();
  const { shipping, tax, total } = calculatePricing(subtotal);

  // redirect to cart if empty cart
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // --- VALIDATION ---
  const basicRequiredFields = [
    "email",
    "firstName",
    "lastName",
    "phone",
  ] as const;

  const shippingRequiredFields = [
    "address1",
    "city",
    "state",
    "postalCode",
    "country",
  ] as const;

  const validateForm = useCallback(() => {
    // Requireds
    for (const field of basicRequiredFields) {
      const v = (formData as any)[field];
      if (!(`${v}`.trim())) {
        showFieldError(field);
        return false;
      }
    }
    // basic formats
    if (!emailRegex.test(formData.email.trim())) {
      showToastError("Invalid Email", "Please enter a valid email address.");
      return false;
    }
    if (!phoneRegex.test(formData.phone.trim())) {
      showToastError(
        "Invalid Phone",
        "Please enter a valid 10-digit Indian mobile number starting with 6-9."
      );
      return false;
    }

    // shipping section is required for UX consistency (and future proofing)
    for (const field of shippingRequiredFields) {
      const v = (formData as any)[field];
      if (!(`${v}`.trim())) {
        showFieldError(field);
        return false;
      }
    }

    if (!formData.acceptTerms) {
      showToastError("Terms Not Accepted", "Please accept the terms & conditions to proceed.");
      return false;
    }

    return true;
  }, [formData]);

  const showFieldError = (fieldKey: string) => {
    const nice = fieldKey.replace(/([A-Z])/g, " $1").toLowerCase();
    showToastError("Missing Field", `Please fill in the ${nice} field.`);
  };

  const showToastError = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const isFormValid = useMemo(() => {
    // quick check to enable/disable button
    const allRequired = [...basicRequiredFields, ...shippingRequiredFields];
    const filled = allRequired.every((k) => `${(formData as any)[k]}`.trim() !== "");
    const validEmail = emailRegex.test(formData.email.trim());
    const validPhone = phoneRegex.test(formData.phone.trim());
    return filled && validEmail && validPhone && formData.acceptTerms && cartItems.length > 0;
  }, [formData, cartItems]);

  // --- APPLY PROMO (client-side mock) ---
  // If you want actual promos, do it on server-side and return new totals.
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string>("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = formData.promoCode.trim().toUpperCase();

    // demo logic
    if (!code) {
      setPromoApplied(false);
      setPromoMessage("Enter a promo code.");
      return;
    }
    if (code === "WELCOME10") {
      setPromoApplied(true);
      setPromoMessage("Promo applied! (Note: calculation remains server-authoritative.)");
    } else {
      setPromoApplied(false);
      setPromoMessage("Invalid promo code.");
    }
  };

  // --- HANDLE SUBMIT (PAYMENT LINK) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      assertApiUrl();

      const fullApiUrl = `${API_URL}/api/checkout/payment-link`;
      const { email, firstName, lastName, phone } = formData;

      // 👉 CRITICAL: match the OLD working payload
      // (Only include shipping if you intentionally switched backend contract.)
      const payload: Record<string, any> = {
        userName: `${firstName} ${lastName}`.trim(),
        userEmail: email.trim(),
        userPhone: phone.trim(),
        cartItems,
        totalAmount: safeNumber(total),
      };

      if (SEND_SHIPPING_TO_BACKEND) {
        const { address1, address2, city, state, postalCode, country, notes } = formData;
        payload.shippingAddress = {
          address1,
          address2,
          city,
          state,
          postalCode,
          country,
          notes,
        };
      }

      if (ENABLE_DEBUG_PANEL) {
        // eslint-disable-next-line no-console
        console.log("[Checkout] Request URL:", fullApiUrl);
        // eslint-disable-next-line no-console
        console.log("[Checkout] Payload:", payload);
      }

      const res = await axios.post<ServerPaymentResponse>(fullApiUrl, payload, {
        headers: { "Content-Type": "application/json" },
        // withCredentials: true, // enable if your API uses cookies/CORS sessions
      });

      const shortUrl = res?.data?.paymentLink?.short_url;
      if (!shortUrl) {
        const msg = res?.data?.error || "Payment link URL not found in server response.";
        throw new Error(msg);
      }

      // Restore old behavior: clearCart right before redirecting
      clearCart();

      // Redirect to Razorpay (or your PSP) payment page
      window.location.href = shortUrl;
    } catch (err: any) {
      let errorMessage = "Failed to generate payment link. Please try again.";
      if (axios.isAxiosError(err)) {
        const serverErr = err.response?.data as any;
        if (serverErr?.error) errorMessage = serverErr.error;
      } else if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }

      if (ENABLE_DEBUG_PANEL) {
        // eslint-disable-next-line no-console
        console.error("[Checkout] Payment link error:", err);
      }

      showToastError("Error", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <HeaderBlock />

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: Forms */}
            <div className="space-y-6">
              <CheckoutSection
                icon={<User className="w-5 h-5" />}
                title="Contact Information"
              >
                <TwoCol>
                  <InputGroup
                    id="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    autoComplete="given-name"
                  />
                  <InputGroup
                    id="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    autoComplete="family-name"
                  />
                </TwoCol>
                <TwoCol>
                  <InputGroup
                    id="email"
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    helperText={!formData.email || emailRegex.test(formData.email) ? "" : "Enter a valid email"}
                  />
                  <InputGroup
                    id="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    maxLength={10}
                    helperText={!formData.phone || phoneRegex.test(formData.phone) ? "" : "10-digit number starting 6-9"}
                  />
                </TwoCol>
              </CheckoutSection>

              <CheckoutSection
                icon={<ShieldCheck className="w-5 h-5" />}
                title="Shipping Address"
              >
                <InputGroup
                  id="address1"
                  label="Address Line 1"
                  value={formData.address1}
                  onChange={handleInputChange}
                  autoComplete="address-line1"
                />
                <InputGroup
                  id="address2"
                  label="Address Line 2 (Optional)"
                  value={formData.address2}
                  onChange={handleInputChange}
                  autoComplete="address-line2"
                />
                <TwoCol>
                  <InputGroup
                    id="city"
                    label="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    autoComplete="address-level2"
                  />
                  <InputGroup
                    id="state"
                    label="State / Province"
                    value={formData.state}
                    onChange={handleInputChange}
                    autoComplete="address-level1"
                  />
                </TwoCol>
                <TwoCol>
                  <InputGroup
                    id="postalCode"
                    label="Postal Code"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    autoComplete="postal-code"
                  />
                  <InputGroup
                    id="country"
                    label="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                    autoComplete="country-name"
                  />
                </TwoCol>

                <Label className="text-gray-700 dark:text-gray-300">Order Notes (Optional)</Label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any specific delivery instructions…"
                  className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />

                <div className="flex items-center gap-3 pt-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked))}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-gray-600 dark:text-gray-300">
                    I agree to the <a href="/terms" className="underline">Terms & Conditions</a>.
                  </Label>
                </div>
              </CheckoutSection>

              <CheckoutSection icon={<Info className="w-5 h-5" />} title="Promo Code">
                <form className="flex items-end gap-3" onSubmit={handleApplyPromo}>
                  <InputGroup
                    id="promoCode"
                    label="Enter Code"
                    value={formData.promoCode}
                    onChange={handleInputChange}
                    placeholder="WELCOME10"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="whitespace-nowrap"
                    disabled={!formData.promoCode.trim()}
                  >
                    Apply
                  </Button>
                </form>
                {!!promoMessage && (
                  <p
                    className={`text-sm mt-1 ${
                      promoApplied ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {promoMessage}
                  </p>
                )}
              </CheckoutSection>
            </div>

            {/* RIGHT: Summary */}
            <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-gray-100">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item: CartItem) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://via.placeholder.com/64?text=No+Image";
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {formatPrice(safeNumber(item.price) * safeNumber(item.quantity))}
                        </p>
                      </div>
                    ))}

                    <Separator className="bg-gray-200 dark:bg-gray-700" />

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <SummaryRow label="Subtotal" value={formatPrice(safeNumber(subtotal))} />
                      <SummaryRow label="Shipping" value={shipping === 0 ? "Free" : formatPrice(safeNumber(shipping))} />
                      <SummaryRow label="Tax" value={formatPrice(safeNumber(tax))} />
                      {promoApplied && <SummaryRow label="Promo (display only)" value="- " />}
                      <Separator className="bg-gray-200 dark:bg-gray-700" />
                      <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-gray-100">
                        <span>Total</span>
                        <span>{formatPrice(safeNumber(total))}</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={!isFormValid || isProcessing}
                      className="w-full mt-6 bg-gray-800 text-white hover:bg-black dark:bg-gray-200 dark:text-black dark:hover:bg-white transition-all duration-300 transform hover:scale-105"
                      size="lg"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing…
                        </span>
                      ) : (
                        <>
                          Complete Order
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1 mt-2">
                      <Lock className="w-3 h-3" /> Your order details are safe and secure.
                    </p>

                    {/* API URL warning if missing */}
                    {!API_URL && (
                      <div className="mt-4 flex items-start gap-3 rounded-md border border-yellow-400/40 bg-yellow-50 dark:bg-yellow-950/30 p-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <div className="text-xs text-yellow-800 dark:text-yellow-300">
                          <strong>Warning:</strong> VITE_API_URL is not set. Set it in your environment.
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Optional: Debug Panel */}
              {ENABLE_DEBUG_PANEL && (
                <DebugPanel
                  show={showDebug}
                  onToggle={() => setShowDebug((s) => !s)}
                  formData={formData}
                  cartItems={cartItems}
                  totals={{ subtotal, shipping, tax, total }}
                  endpoint={`${API_URL || "(missing)"}/api/checkout/payment-link`}
                  payloadPreview={{
                    userName: `${formData.firstName} ${formData.lastName}`.trim(),
                    userEmail: formData.email.trim(),
                    userPhone: formData.phone.trim(),
                    cartItems,
                    totalAmount: safeNumber(total),
                    ...(SEND_SHIPPING_TO_BACKEND
                      ? {
                          shippingAddress: {
                            address1: formData.address1,
                            address2: formData.address2,
                            city: formData.city,
                            state: formData.state,
                            postalCode: formData.postalCode,
                            country: formData.country,
                            notes: formData.notes,
                          },
                        }
                      : {}),
                  }}
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

// -----------------------------------------------------------------------------
// PRESENTATIONAL SECTIONS & REUSABLES
// -----------------------------------------------------------------------------

const HeaderBlock: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Checkout</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Review your order and securely complete your purchase.
      </p>
    </div>
  );
};

const CheckoutSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
};

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
};

const InputGroup: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  helperText?: string;
  autoComplete?: string;
}> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  helperText,
  autoComplete,
}) => {
  const isInvalid =
    (id === "email" && !!value && !emailRegex.test(value)) ||
    (id === "phone" && !!value && !phoneRegex.test(value));

  return (
    <div className="w-full">
      <Label htmlFor={id} className="text-gray-700 dark:text-gray-300">
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-pink-500 ${
          isInvalid ? "border-red-500 focus:ring-red-500" : ""
        }`}
      />
      {helperText ? (
        <p
          aria-live="polite"
          className={`mt-1 text-xs ${
            isInvalid ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between">
    <span>{label}</span>
    <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);

// -----------------------------------------------------------------------------
// DEBUG PANEL (optional but handy during integration)
// -----------------------------------------------------------------------------
const DebugPanel: React.FC<{
  show: boolean;
  onToggle: () => void;
  formData: FormData;
  cartItems: CartItem[];
  totals: { subtotal: number; shipping: number; tax: number; total: number };
  endpoint: string;
  payloadPreview: Record<string, any>;
}> = ({ show, onToggle, formData, cartItems, totals, endpoint, payloadPreview }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-gray-800 dark:text-gray-100">
          Developer Debug
        </CardTitle>
        <Button size="sm" variant="secondary" onClick={onToggle}>
          {show ? "Hide" : "Show"}
        </Button>
      </CardHeader>
      {show && (
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <div className="font-semibold">ENV</div>
              <pre className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200">
{`API_URL: ${API_URL || "(missing)"}
endpoint: ${endpoint}
SEND_SHIPPING_TO_BACKEND: ${SEND_SHIPPING_TO_BACKEND}`}
              </pre>

              <Separator className="bg-gray-200 dark:bg-gray-700 my-2" />

              <div className="font-semibold">Form Data</div>
              <pre className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="font-semibold">Cart Items</div>
              <pre className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200">
                {JSON.stringify(cartItems, null, 2)}
              </pre>

              <Separator className="bg-gray-200 dark:bg-gray-700 my-2" />

              <div className="font-semibold">Totals</div>
              <pre className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200">
                {JSON.stringify(totals, null, 2)}
              </pre>

              <Separator className="bg-gray-200 dark:bg-gray-700 my-2" />

              <div className="font-semibold">Payload Preview</div>
              <pre className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200">
                {JSON.stringify(payloadPreview, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
  */