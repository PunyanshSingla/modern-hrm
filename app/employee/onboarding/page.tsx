
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import OnboardingForm from "@/components/onboarding-form";

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

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!profile) return <div className="p-8">Error loading profile.</div>;

    if (profile.status === 'pending_verification') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
                <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black uppercase tracking-tight">Onboarding Complete</h1>
                    <p className="text-muted-foreground font-medium max-w-md">
                        Thank you for completing your profile! Your information has been submitted and is currently under review by the HR admin.
                    </p>
                </div>
                <div className="p-4 bg-muted/30 border border-muted-foreground/10 rounded-2xl text-sm italic">
                    You will be able to access the full system once your profile is verified.
                </div>
            </div>
        );
    }

    return (
    <div className="space-y-10 animate-in fade-in duration-700">
        <div className="space-y-2">
             <h1 className="text-4xl font-black tracking-tight uppercase">Employee Onboarding</h1>
             <p className="text-muted-foreground font-medium">Welcome! Please complete your professional profile to begin the verification process.</p>
        </div>  
        
        <div className="bg-card/30 backdrop-blur-sm border border-muted-foreground/10 rounded-[40px] p-8 shadow-sm">
            <OnboardingForm initialData={profile} onUpdate={fetchProfile} />
        </div>
    </div>
    );
}
