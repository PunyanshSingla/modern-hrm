"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import OnboardingForm from "@/components/onboarding-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import { 
    Clock, 
    CheckCircle2, 
    Sparkles, 
    RefreshCw,
    Lock,
    LogOut,
    Loader2
} from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    
    const fetchProfile = async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setIsCheckingStatus(true);
        } else {
            setIsInitialLoading(true);
        }

        try {
            const session = await authClient.getSession();
            if (!session.data) {
                router.push("/login");
                return;
            }
            const res = await fetch(`/api/employee/profile?t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setProfile(data.profile);
                if (data.profile.status === 'verified') {
                    toast.success("Profile verified! Redirecting to dashboard...");
                    router.push("/employee/dashboard");
                    return;
                }
                if (isManualRefresh) {
                    toast.info("Status checked: Your profile is currently under HR review.");
                }
            }
        } catch (e) {
            console.error("Error fetching profile", e);
            if (isManualRefresh) {
                toast.error("Failed to check status. Please try again.");
            }
        } finally {
            setIsInitialLoading(false);
            setIsCheckingStatus(false);
        }
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    useEffect(() => {
        fetchProfile();
    }, [router]);

    if (isInitialLoading) return (
        <div className="w-full max-w-4xl mx-auto py-2 sm:py-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4 pt-2 px-1">
                <div className="flex items-center gap-3">
                    <Logo />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <Card className="w-full max-w-4xl p-8 space-y-6 rounded-3xl border-border/60 bg-card/80 shadow-lg">
                <div className="space-y-2 text-center flex flex-col items-center">
                    <Skeleton className="h-8 w-56 rounded-xl" />
                    <Skeleton className="h-4 w-80 rounded-md" />
                </div>
                <div className="grid grid-cols-4 gap-3 pt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-2xl" />
                    ))}
                </div>
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
            </Card>
        </div>
    );

    if (!profile) return <div className="p-8 text-center text-muted-foreground font-medium">Error loading profile details. Please log in again.</div>;

    return (
        <div className="w-full max-w-4xl mx-auto py-2 sm:py-6 space-y-6 animate-in fade-in duration-300 relative">
            {/* Top Brand & Header Bar */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4 backdrop-blur-md bg-background/80 sticky top-0 z-30 pt-2 px-1">
                <div className="flex items-center gap-3">
                    <Logo />
                    <Badge variant="outline" className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider text-primary border-primary/30 bg-primary/5">
                        Verification Portal
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg">
                        <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                </div>
            </div>

            {profile.status === 'pending_verification' ? (
                /* Pending Verification Screen */
                <Card className="rounded-2xl border border-amber-500/30 bg-card p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
                    <div className="max-w-xl mx-auto space-y-6 relative z-10">
                        <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-tr from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
                            <Clock className="h-10 w-10 animate-pulse" />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-background"></span>
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider">
                                Under HR Review
                            </Badge>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Verification In Progress
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-md mx-auto">
                                Thank you, <span className="font-semibold text-foreground">{profile.firstName || 'Team Member'}</span>! Your profile information and documents have been submitted to HR Administration.
                            </p>
                        </div>

                        {/* Verification Steps Timeline */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-border/60">
                            <div className="p-4 rounded-xl bg-card border border-border/60 text-left space-y-1 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Step 1</span>
                                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                                </div>
                                <p className="text-xs font-bold text-foreground">Profile Saved</p>
                                <p className="text-[10px] text-muted-foreground">Information submitted</p>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left space-y-1 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Step 2</span>
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-foreground">HR Verification</p>
                                <p className="text-[10px] text-amber-600/90 dark:text-amber-400/90 font-medium">Active document audit</p>
                            </div>

                            <div className="p-4 rounded-xl bg-card/40 border border-border/40 text-left space-y-1 opacity-60">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Step 3</span>
                                    <Lock className="h-4.5 w-4.5 text-muted-foreground" />
                                </div>
                                <p className="text-xs font-bold text-foreground">Workspace Access</p>
                                <p className="text-[10px] text-muted-foreground">Full portal unlock</p>
                            </div>
                        </div>

                        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => fetchProfile(true)} 
                                disabled={isCheckingStatus}
                                className="rounded-xl text-xs font-semibold gap-2 h-9 px-5 border-amber-500/30 hover:bg-amber-500/10 shadow-sm transition-all"
                            >
                                {isCheckingStatus ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" /> Checking Approval Status...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-3.5 w-3.5" /> Check Approval Status
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                /* Form Screen */
                <div className="space-y-6">
                    {/* Header Hero Banner */}
                    <div className="relative rounded-2xl border border-border/80 bg-card p-6 sm:p-8 overflow-hidden shadow-sm">
                        <div className="space-y-2 max-w-2xl relative z-10">
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                <Sparkles className="h-3 w-3" /> Official Onboarding
                            </div>
                            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Welcome to the Team, <span className="text-primary">{profile.firstName || 'Colleague'}</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
                                Complete your personal profile, bank account details, career history, and verification documents to unlock your full workspace access.
                            </p>
                        </div>
                    </div>  
                    
                    {/* Onboarding Form Wizard */}
                    <OnboardingForm initialData={profile} onUpdate={fetchProfile} />
                </div>
            )}
        </div>
    );
}
