// src/components/QuickActions.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Package, 
  MapPin, 
  Settings, 
  Heart,
  HelpCircle,
  Loader2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSection } from "./AccountSection";
import { useNavigate } from "react-router-dom";

// Use environment variable if available, otherwise fallback (Best Practice)
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/user` 
  : "http://localhost:5000/api/user";

interface QuickActionsProps {
  onActionClick: (action: string) => void;
  userName: string;
}

interface ActionItem {
  icon: typeof Package;
  title: string;
  subtitle: string;
  count: number | null;
  action: string;
  color: string;
}

export function QuickActions({ onActionClick, userName }: QuickActionsProps) {
  const navigate = useNavigate();
  
  // State to hold the counts from the database
  const [counts, setCounts] = useState({
    orders: 0,
    addresses: 0,
    wishlist: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [ordersRes, addressesRes, wishlistRes] = await Promise.all([
          axios.get(`${API_URL}/my-orders`, { withCredentials: true }),
          axios.get(`${API_URL}/addresses`, { withCredentials: true }),
          axios.get(`${API_URL}/wishlist`, { withCredentials: true }),
        ]);

        setCounts({
          orders: ordersRes.data ? ordersRes.data.length : 0,
          addresses: addressesRes.data ? addressesRes.data.length : 0,
          wishlist: wishlistRes.data.wishlist ? wishlistRes.data.wishlist.length : 0,
        });
      } catch (error) {
        console.error("Error fetching quick action counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const handleHelpClick = () => {
    const message = `Hi Hansitha Creations,\nThis is ${userName}. 👋\nI need help regarding an order, FAQ, or support ticket.\n\nCould you please assist me?`;
    const whatsappUrl = `https://wa.me/919441611012?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleActionClick = (action: string) => {
    if (action === 'help') {
      handleHelpClick();
    } else if (action === 'wishlist') {
      navigate('/wishlist');
    } else {
      onActionClick(action);
    }
  };

  const quickActions: ActionItem[] = [
    { 
      icon: Package, 
      title: "My Orders", 
      subtitle: "View, track, and manage your orders",
      count: counts.orders, 
      action: "orders",
      color: "text-blue-600 bg-blue-50"
    },
    { 
      icon: MapPin, 
      title: "Saved Addresses", 
      subtitle: "Manage delivery and billing addresses",
      count: counts.addresses, 
      action: "addresses",
      color: "text-orange-600 bg-orange-50"
    },
    { 
      icon: Heart, 
      title: "Wishlist", 
      subtitle: "Your saved favorites for later",
      count: counts.wishlist, 
      action: "wishlist",
      color: "text-pink-600 bg-pink-50"
    },
    { 
      icon: Settings, 
      title: "Account Settings", 
      subtitle: "Profile, security, and preferences",
      count: null, 
      action: "settings",
      color: "text-gray-600 bg-gray-50"
    },
    { 
      icon: HelpCircle, 
      title: "Help & Support", 
      subtitle: "Need help? We’re here for you",
      count: null, 
      action: "help",
      color: "text-green-600 bg-green-50"
    },
  ];
  
  return (
    <AccountSection 
      title="Quick Actions" 
      icon={<Settings className="h-5 w-5 text-primary" />}
    >
      {/* 
        Responsive Grid: 
        1 column on mobile (grid-cols-1)
        2 columns on small screens and up (sm:grid-cols-2)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-0 flex items-stretch border border-gray-200 hover:border-primary/50 transition-all overflow-hidden group bg-white shadow-sm hover:shadow-md"
              onClick={() => handleActionClick(action.action)}
            >
              {/* 
                Left side: Icon Container 
                Responsive width: w-14 on mobile, w-16 on desktop
              */}
              <div className={`flex items-center justify-center flex-shrink-0 w-14 md:w-16 ${action.color} border-r border-gray-100`}>
                {/* Responsive Icon Size: h-6 w-6 on mobile, h-7 w-7 on desktop */}
                <Icon className="h-6 w-6 md:h-7 md:w-7 transition-transform group-hover:scale-110 duration-200" />
              </div>

              {/* Right side: Content */}
              <div className="flex-1 p-3 md:p-4 text-left flex flex-col justify-center gap-0.5 md:gap-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Responsive Title Text */}
                    <span className="font-bold text-sm md:text-base text-gray-900 truncate">
                      {action.title}
                    </span>
                    
                    {/* Count Badge */}
                    {!loading && action.count !== null && action.count > 0 && (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] md:text-xs font-medium bg-primary/10 text-primary rounded-full">
                        {action.count}
                      </span>
                    )}
                    {loading && action.count !== null && (
                       <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-primary transition-colors" />
                </div>
                
                {/* Responsive Subtitle */}
                <p className="text-[11px] md:text-xs text-muted-foreground font-normal line-clamp-1 md:line-clamp-2 leading-tight">
                  {action.subtitle}
                </p>
              </div>
            </Button>
          );
        })}
      </div>
    </AccountSection>
  );
}