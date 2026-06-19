// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (userData: { name: string; email: string; password?: string }) => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserAvatar: (newAvatarUrl: string) => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  googleLogin: async () => {},
  logout: async () => {},
  updateUserAvatar: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Check Session on Load
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

  // 2. Register
  const register = async (userData: { name: string; email: string; password?: string }) => {
    await axios.post(`${API_URL}/api/auth/register`, userData, { withCredentials: true });
  };

  // 3. Login
  const login = async (credentials: { email: string; password: string }) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, credentials, { withCredentials: true });
    if (res.data.success) {
      setUser(res.data.user);
    }
  };

  // 4. ✅ Google Login (Connects to Backend)
  const googleLogin = async (token: string) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google-login`, 
        { token }, 
        { withCredentials: true }
      );
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      throw error; // Rethrow so Login.tsx handles the UI error
    }
  };

  // 5. Logout
  const logout = async () => {
    await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  };

  const updateUserAvatar = (newAvatarUrl: string) => {
    if (user) setUser({ ...user, avatar: newAvatarUrl });
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    if (user) setUser(prevUser => ({ ...prevUser, ...updatedData } as User));
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, googleLogin, logout, updateUserAvatar, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};