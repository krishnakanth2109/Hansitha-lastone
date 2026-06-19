import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPlus, FiMinus, FiEdit2, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { toastWithVoice } from "@/utils/toast";
import { cookieStorage } from "../utils/cookieStorage";

const API_URL = import.meta.env.VITE_API_URL;

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState("");

  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = cookieStorage.getItem("voice-enabled");
    return saved === "false" ? false : true;
  });

  const [showSections, setShowSections] = useState({
    changeRole: false,
    voice: false,
    users: false, 
  });

  const toggleSection = (key: keyof typeof showSections) => {
    if (key === "users" && !showSections.users) {
      fetchAllUsers();
    }
    setShowSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    cookieStorage.setItem("voice-enabled", String(voiceEnabled));
  }, [voiceEnabled]);

  const handleSwitchToUserView = () => navigate("/account");

  // 1. Manual Role Change (Form)
  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.patch(
        `${API_URL}/api/users/update-role`,
        { email, role: newRole },
        { withCredentials: true }
      );
      setMessage(`✅ ${res.data.message}`);
      fetchAllUsers(); 
    } catch (error: any) {
      setMessage(`❌ ${error.response?.data?.message || "Error updating role"}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch All Users
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/all`, {
        withCredentials: true,
      });
      setUsersList(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toastWithVoice.error("Failed to load users list");
    }
  };

  // 3. Inline Role Update
  const startEditing = (user: UserData) => {
    setEditingUserId(user._id);
    setEditingRole(user.role);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditingRole("");
  };

  const saveRole = async (targetEmail: string) => {
    try {
      await axios.patch(
        `${API_URL}/api/users/update-role`,
        { email: targetEmail, role: editingRole },
        { withCredentials: true }
      );
      toastWithVoice.success("Role updated successfully!");
      setEditingUserId(null);
      fetchAllUsers(); 
    } catch (error: any) {
      toastWithVoice.error(error.response?.data?.message || "Failed to update");
    }
  };

  // 4. Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/users/delete/${userId}`, {
        withCredentials: true,
      });
      toastWithVoice.success(`User ${userName} deleted successfully.`);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
    } catch (error: any) {
      console.error("Delete user error:", error);
      toastWithVoice.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const SectionHeader = ({
    title,
    sectionKey,
  }: {
    title: string;
    sectionKey: keyof typeof showSections;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex justify-between items-center py-3 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
    >
      <span className="text-lg font-semibold text-gray-800">{title}</span>
      {showSections[sectionKey] ? <FiMinus /> : <FiPlus />}
    </button>
  );

  return (
    <div className="bg-white min-h-screen w-full p-6 rounded-xl shadow-lg overflow-y-auto">
      <h2 className="text-2xl text-center font-bold mb-6 text-gray-800">Admin Profile</h2>

      {user ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Info Card */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-gray-700"><strong>Name:</strong> {user.name}</p>
            <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
            <p className="text-gray-700">
              <strong>Role:</strong> <span className="uppercase font-bold text-blue-600">{user.role}</span>
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSwitchToUserView}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow"
            >
              Switch to User View
            </button>
          </div>

          {user.role === "admin" && (
            <div className="space-y-4 mt-8">
              <h3 className="font-bold text-xl text-center text-gray-800 border-b pb-2 mb-4">
                Admin Controls
              </h3>

              {/* 1. Change Role Manually */}
              <div>
                <SectionHeader title="Manual Role Assignment" sectionKey="changeRole" />
                {showSections.changeRole && (
                  <form onSubmit={handleRoleChange} className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="Enter user email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update Role"}
                    </button>
                    {message && (
                      <p className={`text-sm mt-2 font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* 2. Voice Toggle */}
              <div>
                <SectionHeader title="System Settings" sectionKey="voice" />
                {showSections.voice && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                    <span className="font-medium text-gray-700">Voice Notifications:</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => setVoiceEnabled((prev) => !prev)}
                        className={`px-4 py-1.5 rounded text-white font-medium transition ${voiceEnabled ? 'bg-blue-600' : 'bg-gray-500'}`}
                      >
                        {voiceEnabled ? "ON 🔊" : "OFF 🔇"}
                      </button>
                      <button
                        onClick={() => toastWithVoice.success("Test notification!", voiceEnabled)}
                        className="px-4 py-1.5 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Users List (Fetch All Users) */}
              <div>
                <SectionHeader title="Manage All Users" sectionKey="users" />
                {showSections.users && (
                  <div className="mt-4 overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usersList.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {editingUserId === u._id ? (
                                <select
                                  value={editingRole}
                                  onChange={(e) => setEditingRole(e.target.value)}
                                  className="p-1 border rounded text-sm"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              ) : (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  u.role === 'admin' ? 'bg-green-100 text-green-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {u.role}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                {editingUserId === u._id ? (
                                  <>
                                    <button onClick={() => saveRole(u.email)} className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded"><FiCheck size={18}/></button>
                                    <button onClick={cancelEditing} className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded"><FiX size={18}/></button>
                                  </>
                                ) : (
                                  <button 
                                    onClick={() => startEditing(u)} 
                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded mr-2"
                                    title="Edit Role"
                                  >
                                    <FiEdit2 size={16} />
                                  </button>
                                )}
                                
                                {/* Delete Button - Added Logic to prevent self-deletion */}
                                {u._id !== user?._id && (
                                  <button 
                                    onClick={() => handleDeleteUser(u._id, u.name)} 
                                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded"
                                    title="Delete User"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {usersList.length === 0 && <p className="text-center p-4 text-gray-500">No users found.</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg animate-pulse">Loading user profile...</p>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;