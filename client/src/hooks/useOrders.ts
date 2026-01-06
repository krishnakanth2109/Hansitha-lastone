// 📁 src/hooks/useOrders.ts
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const useOrders = () => {
  const { refreshUser } = useAuth();

  const placeOrder = async (products: { productId: string; quantity: number }[], total: number) => {
    await axios.post('/api/user/order', { products, total }, { withCredentials: true });
    await refreshUser();
  };

  return { placeOrder };
};
