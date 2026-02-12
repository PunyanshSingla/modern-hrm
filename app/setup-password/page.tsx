
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SetupPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        // This page is reached via the "Forgot Password" link in email which contains a token.
        // Or if we used a custom flow, it might be different.
        // Assuming "Reset your password" link: /reset-password?token=XYZ
        // But the user requested a specific "Join/Setup" flow.
        // Since we used `forgetPassword` API to generate the invite, the link in email points to the URL configured in `forgetPassword` call.
        // In the API, I set `redirectTo: "/setup-password"`.
        // So the email link will be `.../setup-password?token=XYZ`.
        
        const token = new URLSearchParams(window.location.search).get("token");
        if (!token) {
            setError("Invalid or missing token.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await authClient.resetPassword({
                newPassword: password,
                token,
                fetchOptions: {
                    onSuccess: () => {
                         setMessage("Password set successfully! Redirecting to dashboard...");
                         setTimeout(() => router.push("/employee/dashboard"), 2000);
                    },
                    onError: (ctx: any) => {
                        setError(ctx.error.message);
                        setLoading(false);
                    }
                }
            });
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center">
             <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Welcome! Setup your Password</h1>
                    <p className="text-muted-foreground mt-2">
                        Create a password to access your employee dashboard.
                    </p>
                </div>
                
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                {message && <div className="text-green-500 text-sm text-center">{message}</div>}
                
                <form onSubmit={handleSetup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm Password</Label>
                        <Input 
                            id="confirm" 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Setting Password..." : "Set Password & Login"}
                    </Button>
                </form>
             </div>
        </div>
    );
}
