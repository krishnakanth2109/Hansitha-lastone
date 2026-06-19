import React, { forwardRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface SignInPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInPanel = forwardRef<HTMLDivElement, SignInPanelProps>(({ isOpen, onClose }, ref) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={ref}
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
        <h2 className="text-xl font-semibold text-white">{isLogin ? 'Sign In' : 'Register'}</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email or Phone</label>
            <div className="relative">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Enter email or phone"
                required
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Enter password"
                required
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Confirm password"
                  required
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700"
          >
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            {isLogin ? 'Register here' : 'Sign in here'}
          </button>
        </div>

        {isLogin && (
          <div className="mt-4 text-center">
            <button className="text-sm text-gray-500 hover:text-gray-700">
              Forgot Password?
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
});

export default SignInPanel;
