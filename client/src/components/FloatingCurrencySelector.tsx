import React from 'react';
import { CurrencySelector } from './CurrencySelector';
import CurrencyLoadingSpinner from './CurrencyLoadingSpinner';
import { useCurrency } from '@/context/CurrencyContext';

const FloatingCurrencySelector: React.FC = () => {
  const { loading } = useCurrency();

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '120px',
          zIndex: 1000,
          backgroundColor: '#f8fafc',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <CurrencySelector />
      </div>

      {loading && <CurrencyLoadingSpinner />}
    </>
  );
};

export default FloatingCurrencySelector;
