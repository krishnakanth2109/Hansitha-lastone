import { useState } from "react";
import { Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  onAvatarChange?: (newUrl: string) => void; // Optional callback to update avatar in backend
}

const CLOUD_NAME = "dghqyd51b";
const UPLOAD_PRESET = "Uploaded";

export function ProfileHeader({ user, onLogout, onAvatarChange }: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageEdit = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setIsUploading(true);

          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", UPLOAD_PRESET);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (data.secure_url) {
            console.log("Uploaded image URL:", data.secure_url);
            if (onAvatarChange) onAvatarChange(data.secure_url);
          } else {
             console.error("Cloudinary Error:", data.error.message);
          }
        } catch (err) {
          console.error("Error uploading to Cloudinary:", err);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-primary text-primary-foreground shadow-elegant">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-glow/80" />

     

      <div className="relative p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-primary-foreground/20">
              <AvatarImage
                src={
                  user.avatar ||
                  `${encodeURIComponent(user.name)}`
                }
                alt={user.name}
              />
              <AvatarFallback className="bg-primary-foreground/10 text-2xl font-bold">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-soft"
              onClick={handleImageEdit}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-1">Hello</h1>
            <h2 className="text-xl font-semibold text-primary-foreground/90 mb-2">
              {user.name}
            </h2>
            <p className="text-primary-foreground/80">{user.email}</p>
          </div>
        </div>
      </div>
       <Button
        onClick={onLogout}
        size="sm"
        className="absolute top-4 right-4 z-10 bg-white text-red-600 hover:bg-red-100 shadow-md"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </Card>
    
  );
}
