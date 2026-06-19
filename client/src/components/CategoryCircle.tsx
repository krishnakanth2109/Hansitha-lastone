import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Category = {
  _id: string;
  name: string;
  image: string;
};

const CategoryCircle = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("API returned non-array data:", data);
          setCategories([]);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [API_URL]);

  const handleClick = (categoryName: string) => {
    const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/fabrics/${slug}`);
  };

  return (
    <div className="w-full py-6">
      {/* 
        Container Logic:
        - Mobile: flex row + overflow-x-auto (Horizontal Scroll)
        - Tablet (md): Grid with 4 columns
        - Desktop (lg): Grid with 6 columns
        - Large Desktop (xl): Grid with 7 columns
      */}
      <div
        className="
          flex gap-4 overflow-x-auto pb-4 px-4 snap-x scrollbar-hide
          md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 
          md:gap-y-8 md:gap-x-6 md:overflow-visible md:px-0 md:justify-items-center
        "
      >
        {loading
          ? // SKELETON LOADER
            Array(7).fill(null).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex flex-col items-center shrink-0 snap-center"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-gray-200 animate-pulse" />
                <div className="mt-2 w-16 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))
          : // ACTUAL DATA
            categories.map((cat) => (
              <div
                key={cat._id}
                className="
                  flex flex-col items-center cursor-pointer 
                  shrink-0 snap-center group
                  transition-transform duration-200 ease-out
                "
                onClick={() => handleClick(cat.name)}
              >
                {/* Image Container: Responsive Sizes */}
                <div 
                  className="
                    relative overflow-hidden rounded-full 
                    border-[3px] border-gray-100 shadow-sm
                    w-20 h-20         /* Mobile */
                    md:w-24 md:h-24   /* Tablet */
                    lg:w-28 lg:h-28   /* Desktop */
                    group-hover:border-purple-200 group-hover:shadow-lg group-hover:scale-105
                    transition-all duration-300
                  "
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) =>
                      (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')
                    }
                  />
                </div>

                {/* Text Label: Responsive Text Size */}
                <span 
                  className="
                    mt-3 text-center font-medium text-gray-700
                    text-xs           /* Mobile */
                    md:text-sm        /* Tablet */
                    lg:text-base      /* Desktop */
                    group-hover:text-purple-700 transition-colors
                  "
                >
                  {cat.name}
                </span>
              </div>
            ))}
      </div>

      {/* Helper styles to hide scrollbar but allow functionality on mobile */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryCircle;