import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { ProfileHeader } from "@/components/ProfileHeader";
import { QuickActions } from "@/components/QuickActions";
import { RecentOrders } from "@/components/RecentOrders";
import { SecuritySettings } from "@/components/SecuritySettings";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function Account() {
  const [activeSection, setActiveSection] = useState<string>("default");
  const { user, loading, logout, updateUserAvatar } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user === null) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleActionClick = (action: string) => {
    if (action === "addresses") navigate("/address");
    else setActiveSection(action);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleAvatarChange = async (newUrl: string) => {
    try {
      // 1. Send the URL to the new backend endpoint
      await axios.put(
        `${API_URL}/api/auth/avatar`, 
        { avatarUrl: newUrl },
        { withCredentials: true } 
      );

      // 2. Update local state
      updateUserAvatar(newUrl);
      
      // 3. User feedback
      toast.success("Avatar saved successfully!");

    } catch (error) {
      console.error("Failed to save avatar:", error);
      toast.error("Could not save the new avatar. Please try again.");
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "orders": return <RecentOrders />;
      case "settings": return <SecuritySettings />;
      default: return <QuickActions onActionClick={handleActionClick} userName={user.name} />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400">
        <main className="container mx-auto px-4 py-6 space-y-6">
          <ProfileHeader 
            user={user} 
            onLogout={handleLogout}
            onAvatarChange={handleAvatarChange} 
          />
          
          {/* ✅ Admin Button Check - Now works because API returns role */}
          {user.role === 'admin' && (
            <div className="flex justify-center my-4">
              <Link to="/admin">
                <Button 
                  size="lg" 
                  className="bg-purple-600 text-white hover:bg-purple-700 transition-transform transform hover:scale-105 shadow-lg"
                >
                  Go to Admin Panel
                </Button>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">{renderMainContent()}</div>
        </main>
        <Footer />
      </div>
    </Layout>
  );
}
