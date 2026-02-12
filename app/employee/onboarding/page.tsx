
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
        <div className="p-8 max-w-3xl mx-auto space-y-8">
            <div>
                 <h1 className="text-3xl font-bold">Employee Onboarding</h1>
                 <p className="text-muted-foreground">Please complete your details for verification.</p>
            </div>  
            
            <OnboardingForm initialData={profile} onUpdate={() => router.push('/employee/dashboard')} />
        </div>
    );
}
