import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { toastWithVoice } from "@/utils/toast";
import { cookieStorage } from "../utils/cookieStorage";

const API_URL = import.meta.env.VITE_API_URL;

interface Admin {
  name: string;
  email: string;
}

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = cookieStorage.getItem("voice-enabled");
    return saved === "false" ? false : true;
  });

  const [showSections, setShowSections] = useState({
    changeRole: false,
    voice: false,
    admins: false,
  });

  const toggleSection = (key: keyof typeof showSections) => {
    if (key === "admins" && !admins.length && !showSections.admins) {
      fetchAdmins();
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
    } catch (error: any) {
      setMessage(`❌ ${error.response?.data?.message || "Error updating role"}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/admins`, {
        withCredentials: true,
      });
      setAdmins(res.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
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
      className="w-full flex justify-between items-center py-2 px-3 bg-gray-100 rounded hover:bg-gray-200"
    >
      <span className="text-lg font-semibold">{title}</span>
      {showSections[sectionKey] ? <FiMinus /> : <FiPlus />}
    </button>
  );

  return (
    <div className="bg-white min-h-screen w-full p-4 rounded shadow overflow-y-auto">
      <h2 className="text-xl text-center font-semibold mb-4">Admin Profile</h2>

      {user ? (
        <>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSwitchToUserView}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to User View
            </button>
          </div>

          {user.role === "superadmin" && (
            <div className="space-y-4 text-center mt-6">
              <h1 className="font-semibold text-xl">Additional Plugins</h1>
              {/* Change Role Section */}
              <div>
                <SectionHeader title="Change User Role" sectionKey="changeRole" />
                {showSections.changeRole && (
                  <form onSubmit={handleRoleChange} className="mt-3 space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="Enter Email Address to Change Role"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {loading ? "Updating..." : "Update Role"}
                    </button>
                    {message && <p className="text-sm mt-2">{message}</p>}
                  </form>
                )}
              </div>

              {/* Voice Toggle Section */}
              <div>
                <SectionHeader title="Voice Toggle and Toast Test" sectionKey="voice" />
                {showSections.voice && (
                  <div className="mt-3 space-y-3">
                    <button
                      onClick={() => setVoiceEnabled((prev) => !prev)}
                      className="p-2 px-4 mr-4 bg-blue-500 text-white rounded"
                    >
                      {voiceEnabled ? "Voice: ON 🔊" : "Voice: OFF 🔇"}
                    </button>

                    <button
                      onClick={() =>
                        toastWithVoice.success("Testing Notification Sound.", voiceEnabled)
                      }
                      className="p-2 px-4 bg-green-500 text-white rounded"
                    >
                      Trigger Notification
                    </button>
                  </div>
                )}
              </div>

              {/* Admins List Section */}
              <div>
                <SectionHeader title="Admins List" sectionKey="admins" />
                {showSections.admins && (
                  <ul className="mt-3 space-y-2">
                    {admins.map((admin) => (
                      <li key={admin.email} className="border p-2 rounded">
                        <span className="font-medium">{admin.name}</span>
                        <br />
                        <span className="text-sm text-gray-600">{admin.email}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};

export default AdminProfile;
