"use client";
import Link from "next/link";
import Logo from "./logo";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordCard() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div
            data-slot="card"
            className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-15 relative w-full max-w-md overflow-hidden border-none pt-12 shadow-lg"
        >
            <div className="to-primary/10 pointer-events-none absolute top-0 h-52 w-full rounded-t-xl bg-gradient-to-t from-transparent" />

            <svg
                width="520"
                height="209"
                viewBox="0 0 520 209"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute inset-x-0 top-0"
            >
                {[...Array(25)].map((_, i) => (
                    <line
                        key={i}
                        x1={26.25 + i * 19}
                        y1="0"
                        x2={26.25 + i * 19}
                        y2={[
                            94.7007, 109.92, 130.213, 130.213, 145.433, 172.49, 172.49,
                            172.49, 145.433, 130.213, 130.213, 109.92, 94.7007, 109.92,
                            130.213, 130.213, 145.433, 172.49, 172.49, 172.49, 145.433,
                            130.213, 130.213, 109.92, 94.7007
                        ][i]}
                        stroke={`url(#paint${i}_linear)`}
                        strokeOpacity="0.1"
                        strokeWidth="0.5"
                    />
                ))}
                <defs>
                    {[...Array(25)].map((_, i) => (
                        <linearGradient
                            key={i}
                            id={`paint${i}_linear`}
                            x1={25.5 + i * 19}
                            y1="0"
                            x2={25.5 + i * 19}
                            y2="172.49"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="var(--primary)" />
                            <stop offset="1" stopColor="var(--primary-foreground)" />
                        </linearGradient>
                    ))}
                </defs>
            </svg>

            <div
                data-slot="card-header"
                className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] justify-center gap-6 text-center"
            >
                <Logo />

                <div>
                    <div data-slot="card-title" className="font-semibold mb-1.5 text-2xl">
                        Reset Password
                    </div>
                    <div
                        data-slot="card-description"
                        className="text-muted-foreground text-base"
                    >
                        Time for a fresh start! Go ahead and set a new <br />password.
                    </div>
                </div>
            </div>

            <div data-slot="card-content" className="px-6 space-y-3">
                <form 
                    className="space-y-6"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (password !== confirmPassword) {
                            setError("Passwords do not match");
                            return;
                        }
                        setIsLoading(true);
                        setError("");
                        setMessage("");
                        
                        // Get token from URL
                        // Note: In a real app, ensure this component is suspended or token is passed as prop
                        const token = new URLSearchParams(window.location.search).get("token");
                        
                        if (!token) {
                            setError("Missing reset token");
                            setIsLoading(false);
                            return;
                        }

                        await authClient.resetPassword({
                            newPassword: password,
                            token,
                            fetchOptions: {
                                onSuccess: () => {
                                    setMessage("Password reset successful. You can now login.");
                                    setIsLoading(false);
                                    setTimeout(() => router.push("/login"), 2000);
                                },
                                onError: (ctx: any) => {
                                    setError(ctx.error.message);
                                    setIsLoading(false);
                                }
                            }
                        });
                    }}
                >
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {message && <p className="text-green-500 text-sm">{message}</p>}

                    {/* New Password */}
                    <div className="space-y-1">
                        <label
                            data-slot="label"
                            className="text-sm font-medium"
                        >
                            New Password*
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                data-slot="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-input h-9 w-full rounded-md border bg-transparent px-3 pr-10 text-base shadow-xs outline-none focus-visible:ring-[3px]"
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <label
                            data-slot="label"
                            className="text-sm font-medium"
                        >
                            Confirm New Password*
                        </label>

                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your new password"
                                data-slot="input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="border-input h-9 w-full rounded-md border bg-transparent px-3 pr-10 text-base shadow-xs outline-none focus-visible:ring-[3px]"
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="size-4" />
                                ) : (
                                    <Eye className="size-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        data-slot="button"
                        disabled={isLoading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-full rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
                    >
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <Link
                    href="/login"
                    data-slot="button"
                    className="hover:bg-accent hover:text-accent-foreground h-9 w-full rounded-md px-4 py-2 text-sm font-medium flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Back to login
                </Link>
            </div>
        </div>
    );
}