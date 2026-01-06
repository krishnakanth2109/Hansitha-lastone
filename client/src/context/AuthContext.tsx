import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Define the shape of the User object
interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  wishlist: any[];
  addresses: any[];
  cart: any[];
}

// Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (userData: { name: string; email: string; password?: string }) => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserAvatar: (newAvatarUrl: string) => void;
  updateUser: (updatedData: Partial<User>) => void; // Function to update any part of the user object
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  googleLogin: async () => {},
  logout: async () => {},
  updateUserAvatar: () => {},
  updateUser: () => {}, // Provide default for the new function
});

// Custom hook to easily access the context
export const useAuth = () => useContext(AuthContext);

// The provider component that wraps your app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect to verify user session on initial app load
  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyUserSession();
  }, []);

  // --- Authentication Functions ---

  const register = async (userData: { name: string; email: string; password?: string }) => {
    await axios.post(`${API_URL}/api/auth/register`, userData, { withCredentials: true });
  };

  const login = async (credentials: { email: string; password: string }) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, credentials, {
      withCredentials: true,
    });
    if (res.data.success) {
      setUser(res.data.user);
    }
  };

  const googleLogin = async (token: string) => {
    const res = await axios.post(`${API_URL}/api/auth/google-login`, { token }, {
      withCredentials: true,
    });
    if (res.data.success) {
      setUser(res.data.user);
    }
  };

  const logout = async () => {
    await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  };

  // --- User State Update Functions ---

  const updateUserAvatar = (newAvatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: newAvatarUrl };
      setUser(updatedUser);
    }
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      // Merges previous user data with the new data
      setUser(prevUser => ({ ...prevUser, ...updatedData } as User));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      register, 
      login, 
      googleLogin, 
      logout,
      updateUserAvatar,
      updateUser // Provide the new function to the context
    }}>
      {children}
    </AuthContext.Provider>
  );
};