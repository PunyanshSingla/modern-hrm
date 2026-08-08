"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarPlus, ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

interface LeaveBalance {
    leaveTypeId: {
        _id: string;
        name: string;
        color: string;
    };
    balance: number;
}

export function LeaveRequestWidget() {
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalances = async () => {
            try {
                const res = await fetch("/api/employee/leave-balances");
                const data = await res.json();
                if (data.success) {
                    setBalances(data.leaveBalances || []);
                }
            } catch (error) {
                console.error("Error fetching leave balances:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBalances();
    }, []);

    if (loading) return (
        <div className="h-full min-h-[300px] flex items-center justify-center p-8 border border-border/60 rounded-2xl animate-pulse bg-card">
             <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div>
        </div>
    );

    const validBalances = balances.filter(b => b.leaveTypeId);
    const topBalances = validBalances.slice(0, 4); 

    return (
        <Card className="h-full rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <CardHeader className="p-0 pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-semibold text-foreground">Leave Balances</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Time off balance & requests</CardDescription>
                    </div>
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Briefcase className="h-4 w-4" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col justify-between space-y-6 pt-2">
                <div className="space-y-3">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available Balance</h4>
                    {topBalances.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {topBalances.map((item, index) => (
                                <div key={index} className="flex flex-col p-3.5 rounded-xl bg-muted/20 border border-border/60 hover:border-primary/30 transition-all">
                                    <span className="text-xs font-medium text-muted-foreground truncate" title={item.leaveTypeId.name}>
                                        {item.leaveTypeId.name}
                                    </span>
                                    <div className="flex items-baseline gap-1 mt-1.5">
                                        <span className="text-2xl font-bold tracking-tight text-foreground">
                                            {item.balance}
                                        </span>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            days
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-muted/10 rounded-xl border border-dashed border-border/60">
                            <p className="text-xs text-muted-foreground">No leave balances assigned yet.</p>
                        </div>
                    )}
                </div>

                <Button asChild className="w-full h-11 rounded-xl font-semibold text-xs uppercase tracking-wider shadow-sm group">
                    <Link href="/employee/leaves/new">
                        Request Leave 
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
