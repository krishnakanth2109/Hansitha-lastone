import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';

const currencyOptions = [
  { code: 'INR', name: 'INR ₹', country: 'in' },
  { code: 'USD', name: 'USD $', country: 'us' },
  { code: 'EUR', name: 'EUR €', country: 'eu' },
  { code: 'GBP', name: 'GBP £', country: 'gb' },
];

export const CurrencySelector: React.FC = () => {
  const { selectedCurrency, setSelectedCurrency, loading } = useCurrency();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value);
  };

  const selectedCountry = currencyOptions.find(opt => opt.code === selectedCurrency)?.country;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center text-sm mt-4">

      <div className="flex items-center gap-2">
        {selectedCountry && (
          <img
            src={`https://flagcdn.com/w40/${selectedCountry}.png`}
            alt={selectedCurrency}
            className="w-6 h-4 rounded-sm shadow"
          />
        )}

        <select
          id="currency"
          value={selectedCurrency}
          onChange={handleChange}
          disabled={loading}
          className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {currencyOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>

        {loading && (
          <svg
            className="animate-spin h-4 w-4 text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
      </div>
    </div>
  );
};
