// ✅ Updated Login.tsx with Dark Mode Support
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
// START: MODIFICATIONS FOR GOOGLE LOGIN
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
// END: MODIFICATIONS FOR GOOGLE LOGIN

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const { login, googleLogin } = useAuth(); // <-- Destructure googleLogin
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [stage, setStage] = useState("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(formData);
      toast.success("Login successful");
      navigate("/account", { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    }
  };

  // START: ADDED FUNCTION FOR GOOGLE LOGIN
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        toast.success("Google login successful!");
        navigate("/account", { replace: true });
      } else {
        throw new Error("Google credential not found");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Google login failed. Please try again.";
      setError(message);
      toast.error(message);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login was unsuccessful. Please try again.");
    console.error("Google Login Failed");
  };
  // END: ADDED FUNCTION FOR GOOGLE LOGIN

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/auth/request-otp`, { email });
      toast.success(data.message || "OTP sent");
      setStage("verify");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword === formData.password) {
      toast.error("Set a new password. Don't reuse the old one.");
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
        password: newPassword,
      });
      toast.success(data.message || "Password reset successful");
      setStage("login");
      setFormData({ email, password: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP or error");
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-lg shadow-lg bg-white dark:bg-gray-900 dark:border-gray-700 relative overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-700 dark:text-purple-400">
        {stage === "login" && "Sign In"}
        {stage === "forgot" && "Forgot Password"}
        {stage === "verify" && "Verify OTP & Reset"}
      </h2>

      <AnimatePresence mode="wait">
        {stage === "login" && (
          <motion.form
            key="login"
            onSubmit={handleLogin}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="Enter your email"
                  required
                  className="w-full py-3 pl-12 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Enter your password"
                  required
                  className="w-full py-3 pl-12 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700"
            >
              Sign In
            </button>

            {/* START: GOOGLE LOGIN BUTTON & DIVIDER */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </div>
            {/* END: GOOGLE LOGIN BUTTON & DIVIDER */}

            <div className="text-center text-sm mt-4 text-purple-600 dark:text-purple-400 hover:underline font-medium">
              <button onClick={() => setStage("forgot")} type="button">
                Forgot Password?
              </button>
            </div>
          </motion.form>
        )}

        {stage === "forgot" && (
          <motion.form
            key="forgot"
            onSubmit={handleSendOtp}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border p-3 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Send OTP
            </button>
            <button
              type="button"
              className="text-sm mt-2 text-purple-600 dark:text-purple-400 hover:underline font-medium"
              onClick={() => setStage("login")}
            >
              Back to Login
            </button>
          </motion.form>
        )}

        {stage === "verify" && (
          <motion.form
            key="verify"
            onSubmit={handleResetPassword}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border p-3 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full border p-3 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Reset Password
            </button>
            <button
              type="button"
              className="text-sm text-gray-500 dark:text-gray-400 mt-2 hover:underline"
              onClick={() => setStage("login")}
            >
              Back to Login
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {stage === "login" && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              Register
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
