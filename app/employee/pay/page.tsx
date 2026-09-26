"use client";

import { useState, useEffect } from "react";
import { 
    Banknote, 
    Download, 
    CreditCard, 
    Building, 
    Wallet, 
    TrendingUp, 
    ShieldCheck, 
    Clock,
    ReceiptIndianRupee
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { PayslipView } from "@/components/payslip-view";
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function MyPayPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchPayInfo = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/employee/pay?month=${month}&year=${year}`);
                const result = await res.json();
                if (result.success) {
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to fetch pay info", error);
                toast.error("Failed to load financial data");
            } finally {
                setLoading(false);
            }
        };
        fetchPayInfo();
    }, [month, year]);

    if (loading) return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-border/60 pb-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 rounded-lg" />
                    <Skeleton className="h-4 w-96 rounded opacity-50" />
                </div>
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28 rounded-2xl opacity-60" />
                <Skeleton className="h-28 rounded-2xl opacity-60" />
                <Skeleton className="h-28 rounded-2xl opacity-60" />
            </div>
            <Skeleton className="h-64 rounded-xl opacity-50" />
        </div>
    );

    if (!data) return <div className="text-center py-12">No financial records found.</div>;

    const { profile, stats, calculation, actualPayout, payrollStatus } = data;
    const isFinal = ['Generated', 'Approved', 'Paid', 'Closed'].includes(payrollStatus);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">My Compensation & Payslips</h1>
                    <p className="text-xs text-muted-foreground mt-1 font-normal">View monthly salary statements, earnings breakdowns, and tax summaries.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <select 
                            className="h-8 rounded-lg border border-border px-2.5 text-xs font-medium bg-background shadow-xs focus:ring-1 focus:ring-primary"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i} value={i}>{format(new Date(2024, i, 1), 'MMMM')}</option>
                            ))}
                        </select>
                        <select 
                            className="h-8 rounded-lg border border-border px-2.5 text-xs font-medium bg-background shadow-xs focus:ring-1 focus:ring-primary"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button 
                                size="sm"
                                className="h-8 text-xs font-medium rounded-lg shadow-xs gap-1.5"
                                disabled={!isFinal}
                            >
                                <ReceiptIndianRupee className="h-3.5 w-3.5" /> 
                                {isFinal ? "View Payslip" : "Payslip Pending"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto p-0 border-none bg-transparent">
                            <PayslipView payroll={calculation} employee={profile} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Net Payout"
                    value={`₹ ${actualPayout.toLocaleString()}`}
                    description={isFinal ? "Official Finalized Amount" : "Calculated Projection"}
                    icon={Wallet}
                    className={cn(
                        isFinal ? "bg-emerald-500/5 border-emerald-500/20" : "bg-primary/5 border-primary/20"
                    )}
                />
                <StatsCard
                    title="Paid Days"
                    value={`${stats.paidDays} / ${stats.totalDays}`}
                    description={`${stats.lopDays} LOP Days detected`}
                    icon={Clock}
                />
                <StatsCard
                    title="Payroll Status"
                    value={payrollStatus}
                    description={isFinal ? "Approved by Administration" : "Pending final generation"}
                    icon={ShieldCheck}
                    className={cn(isFinal ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20")}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-xl border border-border shadow-xs bg-card">
                    <CardHeader className="border-b border-border/60 pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <TrendingUp className="h-4 w-4 text-primary" /> Payout Breakdown
                        </CardTitle>
                        <CardDescription className="text-xs">Itemized pro-rata breakdown for {format(new Date(year, month, 1), 'MMMM yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        <div className="space-y-3">
                            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                                <span className="text-xs font-semibold text-emerald-700 block">Earnings</span>
                                {calculation.earnings.map((e: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-xs font-medium">
                                        <span className="text-muted-foreground">{e.label}</span>
                                        <span className="tabular-nums font-semibold text-foreground">₹ {e.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="border-t border-emerald-500/20 pt-2 flex justify-between items-center text-xs font-semibold text-emerald-800">
                                    <span>Gross Earnings</span>
                                    <span>₹ {calculation.totalEarnings.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-2">
                                <span className="text-xs font-semibold text-rose-700 block">Deductions</span>
                                {calculation.deductions.map((d: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-xs font-medium">
                                        <span className="text-muted-foreground">{d.label}</span>
                                        <span className="tabular-nums font-semibold text-rose-700">- ₹ {d.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="border-t border-rose-500/20 pt-2 flex justify-between items-center text-xs font-semibold text-rose-800">
                                    <span>Total Deductions</span>
                                    <span>- ₹ {calculation.totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className={cn(
                                "p-4 rounded-xl shadow-xs relative overflow-hidden border",
                                isFinal ? "bg-emerald-600 text-white border-emerald-700" : "bg-primary text-primary-foreground border-primary"
                            )}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-medium opacity-90 mb-0.5">Take Home Net Pay</p>
                                        <h2 className="text-2xl font-bold tracking-tight tabular-nums">₹ {actualPayout.toLocaleString()}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border shadow-xs bg-card">
                    <CardHeader className="border-b border-border/60 pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <ReceiptIndianRupee className="h-4 w-4 text-primary" /> Tax & Bank Details
                        </CardTitle>
                        <CardDescription className="text-xs">Projected income tax implications and payout destination.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                         <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-foreground">Tax Regime</span>
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs font-medium">New Regime</Badge>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                    <span>Annual Earnings Projection</span>
                                    <span className="font-semibold text-foreground">₹ {(calculation.totalEarnings * 12).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-semibold text-foreground">
                                    <span>Monthly Estimated TDS</span>
                                    <span>₹ {calculation.statutory?.tds || 0}</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-normal leading-relaxed">
                                Tax estimations are based on active salary structure and government tax slabs.
                            </p>
                         </div>
                         
                         <div className="p-4 rounded-lg bg-card border border-border/60 space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Building className="h-4 w-4" />
                                <span className="font-semibold text-xs text-foreground">Direct Deposit Account</span>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-muted-foreground">{profile.bankDetails?.bankName || "HDFC Bank"}</p>
                                <p className="text-sm font-semibold text-foreground tracking-wider">•••• {profile.bankDetails?.accountNumber?.slice(-4) || "XXXX"}</p>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
