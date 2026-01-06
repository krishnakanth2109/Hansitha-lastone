// src/components/CurrencyLoadingSpinner.tsx
import React from 'react';

const CurrencyLoadingSpinner: React.FC = () => (
  <div className="fixed bottom-[90px] left-5 z-[1001] bg-white p-3 rounded-full shadow-lg border border-gray-300 animate-pulse">
    <svg
      className="animate-spin h-5 w-5 text-gray-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  </div>
);

export default CurrencyLoadingSpinner;
