// client/src/main.tsx (COMPLETE AND CORRECTED)

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import App from './App.tsx';
import './index.css';

// Import all your context providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();
const API_URL = import.meta.env.VITE_API_URL;

fetch(`${API_URL}/products`)
  .then(res => res.json())
  .then(data => console.log(data));

// The root of your application
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <WishlistProvider>
                  <CurrencyProvider>
                    <ThemeProvider>
                      <TooltipProvider>
                        
                        {/* Toaster for notifications */}
                        <Sonner
                          position="bottom-right"
                          expand={true}
                          richColors={true}
                          closeButton={true}
                          duration={2000}
                        />
                        {/* Your main App component */}
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