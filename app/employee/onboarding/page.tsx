
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import OnboardingForm from "@/components/onboarding-form";

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    
    useEffect(() => {
        const checkAuth = async () => {
            const session = await authClient.getSession();
            if (!session.data) {
                router.push("/login");
                return;
            }
            try {
                const res = await fetch("/api/employee/profile");
                const data = await res.json();
                if (data.success) {
                    setProfile(data.profile);
                    if (data.profile.status === 'verified') {
                        router.push("/employee/dashboard"); // Already done
                    }
                }
            } catch (e) {
                console.error("Error fetching profile", e);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!profile) return <div className="p-8">Error loading profile.</div>;

    return (
    <div className="space-y-10 animate-in fade-in duration-700">
        <div className="space-y-2">
             <h1 className="text-4xl font-black tracking-tight uppercase">Employee Onboarding</h1>
             <p className="text-muted-foreground font-medium">Welcome! Please complete your professional profile to begin the verification process.</p>
        </div>  
        
        <div className="bg-card/30 backdrop-blur-sm border border-muted-foreground/10 rounded-[40px] p-8 shadow-sm">
            <OnboardingForm initialData={profile} onUpdate={() => router.push('/employee/dashboard')} />
        </div>
    </div>
    );
}
