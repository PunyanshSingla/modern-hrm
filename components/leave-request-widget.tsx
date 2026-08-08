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
                    setBalances(data.balances || data.leaveBalances || []);
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
        <div className="h-48 flex items-center justify-center p-6 border border-border bg-card rounded-xl animate-pulse">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
    );

    const validBalances = balances.filter(b => b.leaveTypeId);
    const topBalances = validBalances.slice(0, 4); 

    return (
        <Card className="rounded-xl border border-border bg-card p-5 shadow-xs relative overflow-hidden">
            <CardHeader className="p-0 pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-semibold text-foreground">Leave Balances</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">Time off balance & requests</CardDescription>
                    </div>
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 pt-4 space-y-4">
                <div className="space-y-2">
                    <h4 className="text-[11px] font-medium text-muted-foreground">AVAILABLE BALANCE</h4>
                    {topBalances.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2.5">
                            {topBalances.map((item, index) => {
                                const name = typeof item.leaveTypeId === 'object' && item.leaveTypeId !== null
                                    ? (item.leaveTypeId as any).name || "Leave"
                                    : "Leave";
                                return (
                                    <div key={index} className="flex flex-col p-3 rounded-lg bg-muted/30 border border-border/60">
                                        <span className="text-xs font-medium text-muted-foreground truncate" title={name}>
                                            {name}
                                        </span>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-xl font-bold tracking-tight text-foreground">
                                                {item.balance}
                                            </span>
                                            <span className="text-[11px] font-normal text-muted-foreground">
                                                days
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-muted/20 rounded-lg border border-dashed border-border/60">
                            <p className="text-xs text-muted-foreground font-normal">No leave balances assigned yet.</p>
                        </div>
                    )}
                </div>

                <Button asChild className="w-full h-9 rounded-lg font-medium text-xs shadow-xs group gap-1.5">
                    <Link href="/employee/leaves/new">
                        Request Leave 
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
