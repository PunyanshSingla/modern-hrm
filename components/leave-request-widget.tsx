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
        <div className="h-full flex items-center justify-center p-12 border-2 border-dashed rounded-[40px] animate-pulse bg-muted/20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const validBalances = balances.filter(b => b.leaveTypeId);
    const topBalances = validBalances.slice(0, 4); 

    return (
        <Card className="h-full rounded-[40px] border-none bg-gradient-to-br from-card/50 to-background backdrop-blur-sm shadow-xl flex flex-col relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 p-8 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                <CalendarPlus className="h-48 w-48 -rotate-12" />
            </div>

            <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Leaves</CardTitle>
                        <CardDescription className="font-medium text-[11px] uppercase tracking-widest opacity-60">Ask for time off</CardDescription>
                    </div>
                    <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                        <Briefcase className="h-5 w-5" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-8 relative z-10">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Remaining Leaves</h4>
                    {topBalances.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {topBalances.map((item, index) => (
                                <div key={index} className="flex flex-col p-4 rounded-3xl bg-background/40 border border-muted-foreground/10 hover:border-primary/20 transition-all duration-300 hover:scale-[1.02] shadow-sm">
                                    <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground truncate" title={item.leaveTypeId.name}>
                                        {item.leaveTypeId.name}
                                    </span>
                                    <div className="flex items-baseline gap-1.5 mt-2">
                                        <span className="text-3xl font-black tracking-tight text-foreground">
                                            {item.balance}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60">
                                            Days
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/20">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">No leaves available</p>
                        </div>
                    )}
                </div>

                <Button asChild className="w-full h-16 rounded-[24px] group mt-auto font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300">
                    <Link href="/employee/leaves/new">
                        Request Leave 
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
