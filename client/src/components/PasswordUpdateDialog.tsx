import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export function PasswordUpdateDialog({ open, setOpen, onUpdate }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset form on close
  useEffect(() => {
    if (!open) {
      setCurrentPassword("");
      setNewPassword("");
      setLoading(false);
      setSuccess(false);
    }
  }, [open]);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) return;

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        onUpdate?.(); // optional callback
        setTimeout(() => setOpen(false), 1500); // auto-close modal after success
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Button
            className={`w-full flex items-center justify-center gap-2 transition-all ${
              success
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-primary text-white hover:bg-primary/90"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={loading || !currentPassword || !newPassword || success}
            onClick={handlePasswordChange}
          >
            {success ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Updated!
              </>
            ) : loading ? (
              "Updating..."
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
