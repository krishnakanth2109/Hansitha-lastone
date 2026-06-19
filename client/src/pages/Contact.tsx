import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Loader2, Phone, Mail, MapPin } from 'lucide-react';
import { Footer } from '@/components/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes with real-time strict restrictions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    // Strict: Prevent numbers and special characters in the name field while typing
    if (name === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, ''); 
    }

    // Strict: Prevent non-numeric characters in phone field (allows a leading '+')
    if (name === 'phone') {
      value = value.replace(/(?!^\+)[^\d]/g, '');
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear the specific error when the user starts typing
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle form submission and final validations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    let newErrors = { name: '', email: '', phone: '', message: '' };

    // --- Validation Rules ---

    // 1. Name Validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long.';
      isValid = false;
    }

    // 2. Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    // 3. Phone Validation (Optional, but strict if provided)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (formData.phone.trim() && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits).';
      isValid = false;
    }

    // 4. Message Validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required.';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, formData);
      
      if (response.status === 201 || response.status === 200) {
        toast.success(response.data.message || 'Thank you! Your message has been sent successfully.');
        // Reset form
        setFormData({ name: '', email: '', phone: '', message: '' });
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Failed to send message. Please try again later.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content Area with Gradient Background */}
      <div 
        className="flex-grow font-serif text-gray-800 py-16 px-4"
        style={{
          background: 'linear-gradient(to bottom right, #818cf8, #fca5a5)',
        }}
      >
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg backdrop-blur-sm">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-black mb-4">Contact Us</h1>
            <p className="text-lg leading-relaxed text-gray-700">
              Have questions, feedback, or need support? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column: Contact Information */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-black border-b-2 border-pink-200 pb-2">
                Get in Touch
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-pink-500 mt-1" />
                  <div>
                    <strong className="block text-gray-900 font-sans">Email:</strong>
                    <span className="font-sans font-normal text-black block">support@hansithacreations.com</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-pink-500 mt-1" />
                  <div>
                    <strong className="block text-gray-900 font-sans">Phone:</strong>
                    {/* UPDATED: Black color, normal font weight, standard hover effect */}
                    <a 
                      href="tel:+919876543210" 
                      className="text-black font-sans font-normal hover:text-gray-600 hover:underline transition-colors block"
                    >
                   +91 94416 11012
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-pink-500 mt-1" />
                  <div>
                    <strong className="block text-gray-900 font-sans">Address:</strong>
                    {/* UPDATED: Normal font styling (sans-serif) */}
                    <span className="font-sans font-normal text-black block">
                      123 Fashion Street, Hyderabad, India
                    </span>
                  </div>
                </div>

                <p className="pt-4 text-sm text-gray-500 border-t border-gray-100 font-sans">
                  Our team is available to assist you Monday to Friday, from 10:00 AM to 6:00 PM (IST).
                </p>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold text-black border-b-2 border-pink-200 pb-2 mb-6">
                Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1 font-sans">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-sans ${
                      errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-pink-400'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1 font-sans">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1 font-sans">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-sans ${
                      errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-pink-400'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-sans">{errors.email}</p>}
                </div>
                
                {/* Phone Number Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1 font-sans">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91..."
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-sans ${
                      errors.phone ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-pink-400'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.phone}</p>}
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1 font-sans">Questions / Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-sans ${
                      errors.message ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-pink-400'
                    }`}
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-xs mt-1 font-sans">{errors.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold font-sans py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? (
                     <>
                       <Loader2 className="animate-spin mr-2 h-5 w-5" /> Sending...
                     </>
                  ) : (
                    "Submit Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default ContactPage;