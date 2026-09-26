
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import OnboardingForm from "@/components/onboarding-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    
    const fetchProfile = async () => {
        setLoading(true);
        const session = await authClient.getSession();
        if (!session.data) {
            router.push("/login");
            return;
        }
        try {
            const res = await fetch(`/api/employee/profile?t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setProfile(data.profile);
                if (data.profile.status === 'verified') {
                    router.push("/employee/dashboard");
                }
            }
        } catch (e) {
            console.error("Error fetching profile", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <Card className="w-full max-w-2xl p-8 space-y-6">
                <div className="space-y-2 text-center flex flex-col items-center">
                    <Skeleton className="h-8 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-72 rounded opacity-50" />
                </div>
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-10 w-full rounded-lg opacity-40" />
                    <Skeleton className="h-10 w-full rounded-lg opacity-40" />
                    <Skeleton className="h-24 w-full rounded-xl opacity-40" />
                </div>
            </Card>
        </div>
    );
    if (!profile) return <div className="p-8">Error loading profile.</div>;

    if (profile.status === 'pending_verification') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Onboarding Submitted</h1>
                    <p className="text-xs text-muted-foreground font-normal max-w-md">
                        Thank you for completing your profile! Your information is under review by HR Administration.
                    </p>
                </div>
                <div className="p-3 bg-muted/30 border border-border/60 rounded-lg text-xs text-muted-foreground font-medium">
                    Full workspace access will unlock once your profile is verified.
                </div>
            </div>
        );
    }

    return (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="border-b border-border/60 pb-4">
             <h1 className="text-2xl font-bold tracking-tight text-foreground">Employee Onboarding</h1>
             <p className="text-xs text-muted-foreground mt-1 font-normal">Welcome to the team! Please complete your profile information to begin verification.</p>
        </div>  
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
            <OnboardingForm initialData={profile} onUpdate={fetchProfile} />
        </div>
    </div>
    );
}
