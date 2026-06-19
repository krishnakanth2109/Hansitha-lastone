export const calculatePricing = (subtotal: number) => {
  const shipping = subtotal < 5000 ? 200 : 0;              // ₹200 if < 5000
  const tax = Math.round(subtotal * 0.05);                  // 5% of subtotal
  const total = Math.round(subtotal + shipping + tax);
  return { shipping, tax, total };
};