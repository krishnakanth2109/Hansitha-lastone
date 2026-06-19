// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// ✅ Import Google Provider
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import App from './App.tsx';
import './index.css';

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

// ✅ Get Client ID from your variables
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* ✅ Wrap App in GoogleOAuthProvider */}
      <GoogleOAuthProvider clientId={googleClientId || ""}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <WishlistProvider>
                  <CurrencyProvider>
                    <ThemeProvider>
                      <TooltipProvider>
                        <Sonner position="bottom-right" expand={true} richColors={true} closeButton={true} duration={2000} />
                        <App />
                      </TooltipProvider>
                    </ThemeProvider>
                  </CurrencyProvider>
                </WishlistProvider>
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);