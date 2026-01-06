// 📁 src/hooks/useCart.ts
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const useCart = () => {
  const { refreshUser } = useAuth();

  const addToCart = async (productId: string, quantity: number) => {
    await axios.post('/api/user/cart', { productId, quantity }, { withCredentials: true });
    await refreshUser();
  };

  const removeFromCart = async (productId: string) => {
    await axios.delete(`/api/user/cart/${productId}`, { withCredentials: true });
    await refreshUser();
  };

  return { addToCart, removeFromCart };
};