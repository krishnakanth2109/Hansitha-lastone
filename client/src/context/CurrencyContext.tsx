import React, { createContext, useContext, useEffect, useState } from 'react';
import { cookieStorage } from '../utils/cookieStorage';

interface CurrencyContextType {
  selectedCurrency: string;
  conversionRate: number;
  loading: boolean;
  setSelectedCurrency: (currency: string) => void;
  formatPrice: (priceInINR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    return cookieStorage.getItem('currency') || 'INR';
  });

  const [conversionRate, setConversionRate] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchRate = async () => {
      if (selectedCurrency === 'INR') {
        setConversionRate(1);
        return;
      }

      setLoading(true);

      const cacheKey = `rate_INR_${selectedCurrency}`;
      const timestampKey = `rate_timestamp_INR_${selectedCurrency}`;
      const cachedRate = cookieStorage.getItem(cacheKey);
      const cachedTimestamp = cookieStorage.getItem(timestampKey);
      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;

      if (cachedRate && cachedTimestamp && now - parseInt(cachedTimestamp) < twelveHours) {
        console.log(`[💱] Using cached rate INR → ${selectedCurrency}: ${cachedRate}`);
        setConversionRate(parseFloat(cachedRate));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`https://api.frankfurter.app/latest?amount=1&from=INR&to=${selectedCurrency}`);
        const data = await res.json();

        if (data?.rates?.[selectedCurrency]) {
          const rate = data.rates[selectedCurrency];
          setConversionRate(rate);
          cookieStorage.setItem(cacheKey, rate.toString());
          cookieStorage.setItem(timestampKey, now.toString());
        } else {
          if (cachedRate) {
            setConversionRate(parseFloat(cachedRate));
          }
        }
      } catch (err) {
        console.error('[❌] Failed to fetch rate:', err);
        if (cachedRate) {
          setConversionRate(parseFloat(cachedRate));
        }
      } finally {
        setLoading(false);
      }
    };

    cookieStorage.setItem('currency', selectedCurrency);
    fetchRate();
  }, [selectedCurrency]);

  const formatPrice = (priceInINR: number) => {
    const converted = priceInINR * conversionRate;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider
      value={{ selectedCurrency, conversionRate, loading, setSelectedCurrency, formatPrice }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
};
