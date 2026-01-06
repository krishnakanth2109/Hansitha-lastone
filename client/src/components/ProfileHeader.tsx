import { useState } from "react";
import { LogOut, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-toastify";

// Define the component's props
interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  onAvatarChange: (newUrl: string) => void;
  onAvatarDelete: () => void; // Prop to handle the delete action
}

// Cloudinary configuration
const CLOUD_NAME = "duajnpevb";
const UPLOAD_PRESET = "Products";

export function ProfileHeader({
  user,
  onLogout,
  onAvatarChange,
  onAvatarDelete,
}: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Handles selecting and uploading a new image
  const handleImageEdit = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (data.secure_url) {
          toast.success("Avatar updated successfully!");
          onAvatarChange(data.secure_url);
        } else {
          throw new Error(data.error?.message || "Cloudinary upload failed.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        toast.error(`Upload failed: ${errorMessage}`);
        console.error("Error uploading to Cloudinary:", err);
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  // Handles the delete button click
  const handleImageDelete = () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      onAvatarDelete();
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-primary text-primary-foreground shadow-elegant">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-glow/80" />

      <Button
        onClick={onLogout}
        size="sm"
        className="absolute top-4 right-4 z-10 bg-white text-red-600 hover:bg-red-100 shadow-md"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

      <div className="relative p-6">
        <div className="flex items-start gap-6">
          {/* AVATAR CONTAINER WITH HOVER EFFECT */}
          <div className="relative flex-shrink-0 group">
            <Avatar className="h-20 w-20 border-4 border-primary-foreground/20">
              <AvatarImage
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(
                    user.name
                  )}`
                }
                alt={user.name}
              />
              <AvatarFallback className="bg-primary-foreground/10 text-2xl font-bold">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>

            {/* Hover overlay with action buttons */}
            <div
              className="absolute inset-0 flex items-center justify-center gap-3 rounded-full bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              {isUploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent" />
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20"
                    onClick={handleImageEdit}
                    aria-label="Change avatar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  {user.avatar && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full bg-red-500/50 text-white hover:bg-red-500/80"
                      onClick={handleImageDelete}
                      aria-label="Delete avatar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-1">Hello 👋</h1>
            <h2 className="text-xl font-semibold text-primary-foreground/90 mb-2 truncate">
              {user.name}
            </h2>
            <p className="text-primary-foreground/80 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}