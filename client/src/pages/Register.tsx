import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user starts typing again
    if (error) setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- VALIDATIONS ---
    
    // 1. Name Validation (At least 2 characters)
    if (formData.name.trim().length < 2) {
      return setError("Name must be at least 2 characters long.");
    }

    // 2. Email Validation (Standard Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError("Please enter a valid email address.");
    }

    // 3. Password Validation (At least 6 characters)
    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    // 4. Confirm Password Match
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    // --- SUBMIT ---
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 mb-20 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 rounded-2xl bg-white">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
        Create an Account
      </h2>

      {/* Error Message Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm py-3 px-4 rounded-lg mb-6 text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="relative">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-4 py-3.5 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-gray-400"
          />
          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-4 py-3.5 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-gray-400"
          />
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password (Min. 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-12 py-3.5 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-gray-400"
          />
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-4 py-3.5 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-gray-400"
          />
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3.5 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-purple-600 hover:text-purple-800 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;