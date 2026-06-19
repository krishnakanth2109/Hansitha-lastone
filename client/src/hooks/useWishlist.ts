// 📁 src/hooks/useWishlist.ts
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const useWishlist = () => {
  const { refreshUser } = useAuth();

  const addToWishlist = async (productId: string) => {
    await axios.post('/api/user/wishlist', { productId }, { withCredentials: true });
    await refreshUser();
  };

  const removeFromWishlist = async (productId: string) => {
    await axios.delete(`/api/user/wishlist/${productId}`, { withCredentials: true });
    await refreshUser();
  };

  return { addToWishlist, removeFromWishlist };
};