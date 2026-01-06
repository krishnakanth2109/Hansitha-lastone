import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const ContactPage = () => {
  // State to manage form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    // In a real application, you would send this data to a backend API
    console.log('Form Submitted:', formData);
    toast.success('Thank you for your message! We will get back to you soon.');
    // Reset form after submission
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div 
      className="font-serif text-gray-800 py-16 px-4 min-h-screen"
      style={{
        // Updated background to the red-indigo gradient
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
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-black border-b-2 border-pink-200 pb-2">
              Get in Touch
            </h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>Email:</strong> support@hansithacreations.com</p>
              <p><strong>Phone:</strong> +91 98765 43210</p>
              <p><strong>Address:</strong> 123 Fashion Street, Hyderabad, India</p>
              <p className="pt-2">
                Our team is available to assist you Monday to Friday, from 10:00 AM to 6:00 PM (IST).
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-black border-b-2 border-pink-200 pb-2 mb-6">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>
              
              {/* Phone Number Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Questions / Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;