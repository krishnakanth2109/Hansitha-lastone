import { Shield, Key, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSection } from "./AccountSection";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PasswordUpdateDialog } from "./PasswordUpdateDialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export function SecuritySettings() {
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // ✅ Using Axios for consistency
      await axios.delete(`${API_URL}/api/auth/delete-account`, {
        withCredentials: true,
      });

      toast.success("Account deleted successfully");
      logout(); // Clear local context
      navigate("/"); // Redirect home
    } catch (err: any) {
      console.error("Delete account error:", err);
      const errorMessage = err.response?.data?.message || "Something went wrong while deleting your account";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <AccountSection 
        title="Security & Privacy" 
        icon={<Shield className="h-5 w-5 text-primary" />}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Update your password regularly to stay secure
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowDialog(true)}>
                Change
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Danger Zone</AlertTitle>
              <AlertDescription>
                Deleting your account will remove all your data permanently. This action cannot be undone.
              </AlertDescription>
            </Alert>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="mt-4 w-full sm:w-auto"
                >
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data (orders, wishlist, cart) from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </AccountSection>

      {/* ✅ Pass the state handler correctly */}
      <PasswordUpdateDialog open={showDialog} setOpen={setShowDialog} />
    </>
  );
}