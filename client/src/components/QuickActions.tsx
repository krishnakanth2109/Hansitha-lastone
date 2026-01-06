// src/components/QuickActions.tsx

import { 
  Package, 
  MapPin, 
  Settings, 
  Heart,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSection } from "./AccountSection";
import { useNavigate } from "react-router-dom"; // Add this import

const quickActions = [
  { icon: Package, label: "My Orders", count: 3, variant: "card" as const, action: "orders" },
  { icon: MapPin, label: "Addresses", count: 2, variant: "card" as const, action: "addresses" },
  { icon: Heart, label: "Wishlist", count: 12, variant: "card" as const, action: "wishlist" },
  { icon: Settings, label: "Account Settings", variant: "card" as const, action: "settings" },
  { icon: HelpCircle, label: "Help & Support", variant: "card" as const, action: "help" },
];

interface QuickActionsProps {
  onActionClick: (action: string) => void;
  userName: string;
}

export function QuickActions({ onActionClick, userName }: QuickActionsProps) {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleHelpClick = () => {
    const message = `Hi Hansitha Creations,\nThis is ${userName}. 👋\nI need help with something. Could you please assist me?\n\nThanks in advance! 🙏`;
    const whatsappUrl = `https://wa.me/918142504687?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleActionClick = (action: string) => {
    if (action === 'help') {
      handleHelpClick();
    } else if (action === 'wishlist') {
      // Navigate to wishlist page
      navigate('/wishlist');
    } else {
      onActionClick(action);
    }
  };
  
  return (
    <AccountSection 
      title="Quick Actions" 
      icon={<Settings className="h-5 w-5 text-primary" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gradient-subtle"
            onClick={() => handleActionClick(action.action)}
          >
            <action.icon className="h-6 w-6 text-primary" />
            <div className="text-center">
              <div className="font-medium">{action.label}</div>
              {action.count && (
                <div className="text-xs text-muted-foreground">{action.count} items</div>
              )}
            </div>
          </Button>
        ))}
      </div>
    </AccountSection>
  );
}