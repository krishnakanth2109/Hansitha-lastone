
import React from 'react';
import { Button } from '@/components/ui/button';

export const PromoSection = () => {
  const promoCards = [
    {
      title: "Smart Deals",
      subtitle: "Trending Smartphones",
      description: "Exchange Offer Available",
      price: "From ₹6,299",
      buttonText: "Shop Now",
      bgColor: "from-green-400 to-green-500",
      icon: "📱"
    },
    {
      title: "Best Deals On Fashion",
      subtitle: "Min 50% Off",
      description: "Latest Collection",
      price: "",
      buttonText: "Shop Now",
      bgColor: "from-blue-400 to-blue-500",
      icon: "👗"
    },
    {
      title: "Cold Drinks & Snacks",
      subtitle: "UP TO 33% OFF",
      description: "Summer Essentials",
      price: "",
      buttonText: "Shop Now",
      bgColor: "from-orange-400 to-red-500",
      icon: "🥤"
    },
    {
      title: "Exciting Deal on iPhone 15",
      subtitle: "From ₹57,990*",
      description: "Limited Period Offer",
      price: "",
      buttonText: "Shop Now",
      bgColor: "from-green-500 to-teal-500",
      icon: "📱"
    }
  ];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        {/* Feature benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'For all Orders Over 1000' },
            { icon: '💳', title: 'Secured Payment', desc: 'Payment Cards Accepted' },
            { icon: '🎁', title: 'Special Gifts', desc: 'Our First Product Order' },
            { icon: '🎧', title: 'Support 24/7', desc: 'Contact us Anytime' }
          ].map((benefit, index) => (
            <div key={index} className="text-center group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">{benefit.title}</h4>
              <p className="text-sm text-gray-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
