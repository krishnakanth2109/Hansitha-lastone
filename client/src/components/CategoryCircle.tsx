import React, { useEffect, useRef, useState } from 'react';

type Category = {
  _id: string;
  name: string;
  image: string;
};

const CategoryCircle = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<'right' | 'left'>('right');
  const isMobile = window.innerWidth < 640;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;

    const container = scrollRef.current;

    const startScrolling = () => {
      intervalRef.current = setInterval(() => {
        if (!container) return;

        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;

        if (currentScroll <= 0) {
          directionRef.current = 'right';
        } else if (currentScroll >= maxScroll - 1) {
          directionRef.current = 'left';
        }

        container.scrollLeft += directionRef.current === 'right' ? 1 : -1;
      }, 20);
    };

    startScrolling();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [categories]);

  const pauseScroll = () => {
    if (isMobile && intervalRef.current) clearInterval(intervalRef.current);
  };

  const resumeScroll = () => {
    if (!isMobile || !scrollRef.current) return;

    const container = scrollRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;

    intervalRef.current = setInterval(() => {
      const currentScroll = container.scrollLeft;

      if (currentScroll <= 0) {
        directionRef.current = 'right';
      } else if (currentScroll >= maxScroll - 1) {
        directionRef.current = 'left';
      }

      container.scrollLeft += directionRef.current === 'right' ? 1 : -1;
    }, 20);
  };

  const handleClick = (categoryName: string) => {
    const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/fabrics/${slug}`;
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto sm:grid sm:grid-cols-7 gap-6 scroll-smooth sm:overflow-visible no-scrollbar"
        onMouseEnter={pauseScroll}
        onMouseLeave={resumeScroll}
      >
        {(loading ? Array(7).fill(null) : categories).map((cat, index) => (
          <div
            key={cat?._id || `placeholder-${index}`}
            className="flex flex-col items-center cursor-pointer shrink-0 sm:shrink transition-all duration-300 ease-in-out"
            onClick={() => cat && handleClick(cat.name)}
            style={{ width: '110px' }}
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-50 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
              {loading ? (
                <div className="w-full h-full animate-pulse bg-gray-300 rounded-full" />
              ) : (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')
                  }
                />
              )}
            </div>
            {!loading && cat?.name && (
              <span className="mt-2 text-sm sm:text-base font-semibold text-center whitespace-nowrap text-gray-700">
                {cat.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryCircle;
