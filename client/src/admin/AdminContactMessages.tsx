import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Trash2, Mail, Phone, Calendar, MessageSquare } from "lucide-react";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

const AdminContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contact`, {
        withCredentials: true,
      });
      setMessages(res.data);
    } catch (error) {
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/contact/${id}`, {
        withCredentials: true,
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading messages...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer Messages</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {messages.length} Total
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No messages found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                  Message
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map((msg) => (
                <tr key={msg._id} className="hover:bg-gray-50 transition-colors">
                  {/* Date Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(msg.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 pl-6 mt-0.5">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Name Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{msg.name}</span>
                  </td>

                  {/* Contact Info Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-blue-600">
                            <Mail className="w-3.5 h-3.5 mr-2" />
                            <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                        </div>
                        {msg.phone && (
                            <div className="flex items-center text-sm text-green-600">
                                <Phone className="w-3.5 h-3.5 mr-2" />
                                <a href={`tel:${msg.phone}`} className="hover:underline">{msg.phone}</a>
                            </div>
                        )}
                    </div>
                  </td>

                  {/* Message Column */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap min-w-[300px] max-h-[150px] overflow-y-auto custom-scrollbar">
                        {msg.message}
                    </div>
                  </td>

                  {/* Action Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-md transition-all duration-200 border border-red-200 hover:border-red-500"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminContactMessages;