import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { user } = useAuth(); // Get the user from AuthContext

  // THIS IS THE KEY FIX: Sync wishlist state with the user object
  useEffect(() => {
    if (user) {
      // The user object now contains the wishlist, so we can set it directly
      const userWishlistIds = user.wishlist.map(item => typeof item === 'object' ? item._id : item);
      setWishlist(userWishlistIds || []);
    } else {
      // If user logs out, clear the wishlist
      setWishlist([]);
    }
  }, [user]); // This effect runs whenever the user object changes

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      // In a real app, you might show a login modal here
      console.error("User not logged in");
      return false;
    }

    try {
      // Optimistically update UI for better user experience
      const isCurrentlyInWishlist = wishlist.includes(productId);
      const optimisticWishlist = isCurrentlyInWishlist
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];
      setWishlist(optimisticWishlist);

      // Make API call to the backend
      const response = await axios.post(
        `${API_URL}/api/users/wishlist`,
        { productId },
        { withCredentials: true }
      );

      // Sync with the actual data from the server
      if (response.data.success) {
        const serverWishlistIds = response.data.wishlist.map((item: any) => typeof item === 'object' ? item._id : item);
        setWishlist(serverWishlistIds);
        return response.data.action === 'added';
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      // Revert optimistic update on failure
      if (user.wishlist) {
         const userWishlistIds = user.wishlist.map(item => typeof item === 'object' ? item._id : item);
         setWishlist(userWishlistIds);
      }
    }
    return false;
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};