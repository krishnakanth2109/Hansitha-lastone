import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toastWithVoice } from "@/utils/toast";
import { useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import { useCurrency } from '../context/CurrencyContext';
// 👇 1. IMPORT THE CURRENCY SELECTOR COMPONENT
import { CurrencySelector } from "../components/CurrencySelector";

const Cart = () => {
  const { formatPrice } = useCurrency();
  const { products } = useContext(ProductContext);
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    clearCart,
  } = useCart();
  const uniqueCartItems = [...new Map(cartItems.map(item => [item.id, item])).values()];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-16 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 max-w-xl text-center">
          <img
            src="https://res.cloudinary.com/duajnpevb/image/upload/v1753867238/1000108103_gefpyo.png"
            alt="Empty Cart"
            className="mx-auto w-40 h-40 md:w-56 md:h-56 object-contain mb-6"
          />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Looks like you haven't added anything yet.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl p-6">
              <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Cart Items ({cartItems.length})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium text-sm"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = products.find((p) => p._id === item.id);
                  const stock = product?.stock ?? 0;
                  const isMax = item.quantity >= stock;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative"
                    >
                      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-[80px] h-[120px] object-cover rounded-lg self-center"
                        />
                        <div className="flex w-full text-center sm:text-center">
                          <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex w-full justify-between sm:justify-end sm:items-center gap-2 mt-2 sm:mt-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition"
                          >
                            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-800 dark:text-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (isMax) {
                                toastWithVoice.error("Cannot exceed stock!");
                                return;
                              }
                              updateQuantity(item.id, item.quantity + 1);
                            }}
                            disabled={isMax}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition"
                          >
                            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {isMax && (<p className="text-xs text-red-500 font-medium">Max Stock Added</p>)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 text-sm mb-6 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {formatPrice(getTotalPrice() * 0.1)}
                  </span>
                </div>
                <div className="border-t dark:border-gray-700 pt-4 font-semibold text-lg text-gray-800 dark:text-gray-100">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {formatPrice(getTotalPrice() * 1.1)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 👇 2. ADDED CURRENCY SELECTOR SECTION */}
              <div className="my-6 border-t dark:border-gray-700 pt-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">
                  Buy Prices In
                </h3>
                <div className="flex justify-center">
                  <CurrencySelector />
                </div>
              </div>
              {/* 👆 END OF NEW CODE */}

              <Link
                to="/checkout"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold mb-3"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/shop"
                className="block text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;