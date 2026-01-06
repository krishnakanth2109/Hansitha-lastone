import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="p-6 pb-32 max-w-6xl mx-auto animate-pulse">
      <div className="h-4 w-24 bg-gray-300 rounded mb-4" />
      <div className="h-8 w-1/2 bg-gray-300 rounded mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="h-80 w-full bg-gray-300 rounded" />
          <div className="flex space-x-2">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="w-24 h-24 bg-gray-300 rounded" />
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-4">
          <div className="h-4 w-40 bg-gray-300 rounded" />
          <div className="h-4 w-32 bg-gray-300 rounded" />
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="h-24 w-full bg-gray-300 rounded" />
          <div className="h-6 w-20 bg-gray-300 rounded" />
          <div className="h-10 w-full bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
