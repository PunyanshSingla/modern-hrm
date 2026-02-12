"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmployeeDashboard() {
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
                    if (data.profile.status === 'invited') {
                        router.push("/employee/onboarding");
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
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-bold">Hello, {profile.firstName || 'Employee'}</h1>
                     <p className="text-muted-foreground">Welcome to your employee portal.</p>
                </div>
                <Badge variant={profile.status === 'verified' ? 'outline' : 'secondary'} className="text-lg px-4 py-1">
                    Status: {(profile.status || 'invited').charAt(0).toUpperCase() + (profile.status || 'invited').slice(1)}
                </Badge>
            </div>
            
            {profile.status === 'verified' ? (
                <Card className="bg-green-50/50 border-green-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                            <CardTitle className="text-green-700">You are Verified!</CardTitle>
                        </div>
                        <CardDescription className="text-green-600/80">
                            Your onboarding is complete and verified by the admin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Access your payslips, leaves, and other details here.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-6 w-6 text-amber-600" />
                            <CardTitle className="text-amber-700">Onboarding In Progress</CardTitle>
                        </div>
                        <CardDescription className="text-amber-600/80">
                            Please complete your onboarding process to get verified.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/employee/onboarding">
                            <Button variant="default">Go to Onboarding</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
