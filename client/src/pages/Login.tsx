import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"login" | "forgot" | "verify">("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await login(formData);
      toast.success("Login successful");
      navigate("/account", { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        toast.success("Google login successful!");
        navigate("/account", { replace: true });
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError("Google login failed.");
      toast.error("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login popup closed or failed.");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/request-otp`, { email });
      toast.success(data.message || "OTP sent");
      setStage("verify");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long.");
        return;
    }

    if (newPassword === formData.password) return toast.error("Set a new password.");
    
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp, password: newPassword });
      toast.success(data.message || "Password reset successful");
      setStage("login");
      setFormData({ email, password: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP or error");
    } finally {
      setLoading(false);
    }
  };

  const fadeVariants = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-8">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">
          {stage === "login" && "Welcome Back"}
          {stage === "forgot" && "Reset Password"}
          {stage === "verify" && "Enter OTP"}
        </h2>
        
        <AnimatePresence mode="wait">
          {stage === "login" && (
            <motion.div key="login" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">{error}</div>}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} 
                      required 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400" 
                      placeholder="name@company.com" 
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password} 
                      onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} 
                      required 
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400" 
                      placeholder="•••••••• (min 6 chars)" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
                <div className="flex justify-end"><button type="button" onClick={() => setStage("forgot")} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot?</button></div>
                
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap theme="outline" width="100%" shape="pill" />
              </div>

              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create account</Link>
              </p>
            </motion.div>
          )}

          {stage === "forgot" && (
            <motion.form key="forgot" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleSendOtp} className="space-y-4">
               <input 
                 type="email" 
                 placeholder="Enter your email" 
                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400" 
                 value={email} 
                 onChange={(e) => setEmail(e.target.value)} 
                 required 
               />
               <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg">{loading ? "Sending..." : "Send OTP"}</button>
               <button type="button" onClick={() => setStage("login")} className="w-full text-sm text-gray-500">Back to Login</button>
            </motion.form>
          )}

          {stage === "verify" && (
             <motion.form key="verify" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleResetPassword} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Enter OTP" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                />
                <input 
                  type="password" 
                  placeholder="New Password (min 6 chars)" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
                <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg">{loading ? "Resetting..." : "Reset Password"}</button>
                <button type="button" onClick={() => setStage("login")} className="w-full text-sm text-gray-500">Back to Login</button>
             </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;