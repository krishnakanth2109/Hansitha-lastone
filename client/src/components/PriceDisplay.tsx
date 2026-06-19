// components/PriceDisplay.tsx
// Reusable price display component that shows offer price, original price, and discount badge

import React from "react";
import { useCurrency } from "../context/CurrencyContext";

interface PriceDisplayProps {
  price: number;                    // Final/offer price (always required)
  originalPrice?: number | null;    // MRP / original price
  discountPercentage?: number;      // e.g. 20 = 20% off
  size?: "sm" | "md" | "lg";       // Controls font size
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  discountPercentage,
  size = "md",
  className = "",
}) => {
  const { formatPrice } = useCurrency();

  const hasDiscount = originalPrice && originalPrice > price;
  const discount = discountPercentage && discountPercentage > 0
    ? discountPercentage
    : hasDiscount
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const sizeClasses = {
    sm: { offer: "text-sm font-bold", original: "text-xs", badge: "text-[9px] px-1.5 py-0.5" },
    md: { offer: "text-base font-bold", original: "text-xs", badge: "text-[10px] px-1.5 py-0.5" },
    lg: { offer: "text-2xl font-black", original: "text-sm", badge: "text-xs px-2 py-1" },
  };

  const s = sizeClasses[size];

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* Offer / Final Price */}
      <span className={`text-gray-900 ${s.offer}`}>
        {formatPrice(price)}
      </span>

      {/* Original Price (strikethrough) */}
      {hasDiscount && (
        <span className={`text-gray-400 line-through ${s.original}`}>
          {formatPrice(originalPrice!)}
        </span>
      )}

      {/* Discount Badge */}
      {discount > 0 && (
        <span className={`bg-green-100 text-green-700 font-bold rounded-sm ${s.badge}`}>
          {discount}% off
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;