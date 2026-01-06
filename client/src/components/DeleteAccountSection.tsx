// src/components/DeleteAccountSection.tsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AccountSection } from "./AccountSection";
import { Button } from "./ui/button";

export function DeleteAccountSection() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure? This will permanently delete your account and all associated data.')) {
            return;
        }

        setIsDeleting(true);
        setError("");

        try {
            await axios.delete('/api/users/me', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            logout();
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete account');
            setIsDeleting(false);
        }
    };

    return (
        <AccountSection title="Delete Account" className="border-red-200 bg-red-50">
            <div className="space-y-4">
                <p className="text-sm text-red-600">
                    Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                
                <Button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    variant="destructive"
                    className="w-full sm:w-auto"
                >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
                
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
        </AccountSection>
    );
}