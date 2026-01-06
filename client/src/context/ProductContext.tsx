import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

// =======================
// ✅ Interfaces
// =======================
export interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured?: boolean;
  description?: string;
  extraImages?: string[];
  published?: boolean;
}

interface ProductContextType {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  loading: boolean;
  reloadProducts: () => Promise<void>;
}

interface ProductProviderProps {
  children: ReactNode;
}

// =======================
// ✅ Create Context
// =======================
export const ProductContext = createContext<ProductContextType | undefined>(
  undefined
);

// =======================
// ✅ Custom Hook
// =======================
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};

// ✅ Backward-compatible export
export const useProductContext = useProducts;

// API Base URL
const API_URL = import.meta.env.VITE_API_URL;

// =======================
// ✅ Provider Component
// =======================
export const ProductProvider: React.FC<ProductProviderProps> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const contentType = res.headers.get("Content-Type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Invalid content type from server");
      }

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("[Product Fetch Error]", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        loading,
        reloadProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};