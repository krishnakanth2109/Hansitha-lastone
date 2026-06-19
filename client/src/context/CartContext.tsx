import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { cookieStorage } from "../utils/cookieStorage";

const API_URL = import.meta.env.VITE_API_URL;

// Define the shape of a cart item
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Define the shape of the context
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  getTotalPrice: () => number;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Transform database cart to CartItem format
  const transformDbCartToCartItems = (dbCart: any[]): CartItem[] => {
    return dbCart.map((item) => ({
      id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }));
  };

  // Refresh cart from database
  const refreshCart = async () => {
    if (!user) {
      setCartItems([]);
      cookieStorage.removeItem("cart");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/users/cart`, {
        withCredentials: true,
      });
      if (response.data.success) {
        const transformedCart = transformDbCartToCartItems(response.data.cart);
        setCartItems(transformedCart);
        cookieStorage.setJSON("cart", transformedCart);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Fallback to cookies if user is logged in but API fails
      const savedCart = cookieStorage.getJSON<CartItem[]>("cart");
      if (savedCart) {
        setCartItems(savedCart);
      }
    }
  };

  // Load cart on user change
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      // If not logged in, load from cookies
      const savedCart = cookieStorage.getJSON<CartItem[]>("cart");
      if (savedCart) {
        setCartItems(savedCart);
      } else {
        setCartItems([]);
      }
    }
  }, [user]);

  // Save cart to cookies on every change (for offline fallback)
  useEffect(() => {
    cookieStorage.setJSON("cart", cartItems);
  }, [cartItems]);

  // Add item to cart
  const addToCart = async (item: CartItem) => {
    if (user) {
      try {
        const response = await axios.post(
          `${API_URL}/api/users/cart`,
          {
            productId: item.id,
            quantity: item.quantity,
          },
          { withCredentials: true }
        );
        if (response.data.success) {
          const transformedCart = transformDbCartToCartItems(response.data.cart);
          setCartItems(transformedCart);
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        // Fallback to local state update
        setCartItems((prev) => {
          const existing = prev.find((i) => i.id === item.id);
          if (existing) {
            return prev.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
            return [...prev, item];
          }
        });
      }
    } else {
      // Not logged in, update cookies only
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          return [...prev, item];
        }
      });
    }
  };

  // Remove item by ID
  const removeFromCart = async (id: string) => {
    if (user) {
      try {
        const response = await axios.delete(`${API_URL}/api/users/cart/${id}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          const transformedCart = transformDbCartToCartItems(response.data.cart);
          setCartItems(transformedCart);
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
        // Fallback to local state update
        setCartItems((prev) => prev.filter((item) => item.id !== id));
      }
    } else {
      // Not logged in, update cookies only
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Update quantity (or remove if zero)
  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    if (user) {
      try {
        const response = await axios.put(
          `${API_URL}/api/users/cart`,
          {
            productId: id,
            quantity: quantity,
          },
          { withCredentials: true }
        );
        if (response.data.success) {
          const transformedCart = transformDbCartToCartItems(response.data.cart);
          setCartItems(transformedCart);
        }
      } catch (error) {
        console.error("Error updating cart quantity:", error);
        // Fallback to local state update
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      }
    } else {
      // Not logged in, update cookies only
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  // Calculate total
  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Clear entire cart
  const clearCart = async () => {
    if (user) {
      try {
        await axios.delete(`${API_URL}/api/users/cart`, {
          withCredentials: true,
        });
        setCartItems([]);
      } catch (error) {
        console.error("Error clearing cart:", error);
        // Fallback to local state update
        setCartItems([]);
      }
    } else {
      // Not logged in, clear cookies only
      setCartItems([]);
    }
  };

  // Return context provider
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
