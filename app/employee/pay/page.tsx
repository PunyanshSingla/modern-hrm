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

    if (loading) return <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    if (!data) return <div className="text-center py-12">No financial records found.</div>;

    const { profile, stats, calculation, actualPayout, payrollStatus } = data;
    const isFinal = ['Generated', 'Approved', 'Paid', 'Closed'].includes(payrollStatus);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="px-3 py-1 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                        <Banknote className="h-3 w-3 mr-2" /> Financial Portal
                    </Badge>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">My <span className="text-primary italic">Compensation</span></h1>
                    <div className="flex items-center gap-3 mt-2">
                        <select 
                            className="h-9 rounded-xl border-2 px-3 font-bold text-xs bg-card"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i} value={i}>{format(new Date(2024, i, 1), 'MMMM')}</option>
                            ))}
                        </select>
                        <select 
                            className="h-9 rounded-xl border-2 px-3 font-bold text-xs bg-card"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
                
                <Dialog>
                    <DialogTrigger asChild>
                        <Button 
                            className="rounded-2xl h-14 px-8 font-black uppercase tracking-tight shadow-xl shadow-primary/20 transition-all group duration-300"
                            disabled={!isFinal}
                        >
                            <ReceiptIndianRupee className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" /> 
                            {isFinal ? "View Full Payslip" : "Final Payslip Pending"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto p-0 border-none bg-transparent">
                        <PayslipView payroll={calculation} employee={{...profile, position: profile.position, department: profile.department }} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Net Payout"
                    value={`₹ ${actualPayout.toLocaleString()}`}
                    description={isFinal ? "Official Finalized Amount" : "Calculated Projection"}
                    icon={Wallet}
                    className={cn(
                        "border-b-4",
                        isFinal ? "bg-emerald-500/5 border-emerald-500/10 border-b-emerald-500" : "bg-primary/5 border-primary/10 border-b-primary"
                    )}
                />
                <StatsCard
                    title="Paid Days"
                    value={`${stats.paidDays} / ${stats.totalDays}`}
                    description={`${stats.lopDays} LOP Days detected`}
                    icon={Clock}
                />
                <StatsCard
                    title="Payroll Rev."
                    value={payrollStatus}
                    description={isFinal ? "Approved by Administration" : "Pending final generation"}
                    icon={ShieldCheck}
                    className={cn(isFinal ? "bg-emerald-500/5" : "bg-amber-500/5")}
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="rounded-[40px] border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden group">
                    <CardHeader className="bg-muted/20 border-b">
                        <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight italic">
                            <TrendingUp className="h-5 w-5 text-primary" /> Payout Mechanics
                        </CardTitle>
                        <CardDescription>Itemized pro-rata breakdown for {format(new Date(year, month, 1), 'MMMM yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">Earnings</span>
                                {calculation.earnings.map((e: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-muted-foreground">{e.label}</span>
                                        <span className="tabular-nums">₹ {e.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="border-t border-emerald-500/10 pt-2 flex justify-between items-center font-black text-emerald-700">
                                    <span>Gross Earnings</span>
                                    <span>₹ {calculation.totalEarnings.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 block">Statutory Deductions</span>
                                {calculation.deductions.map((d: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-muted-foreground/70">{d.label}</span>
                                        <span className="tabular-nums text-rose-600/80">- ₹ {d.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="border-t border-rose-500/10 pt-2 flex justify-between items-center font-black text-rose-700">
                                    <span>Total Deductions</span>
                                    <span>- ₹ {calculation.totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className={cn(
                                "p-6 rounded-[32px] shadow-lg relative overflow-hidden",
                                isFinal ? "bg-emerald-600 text-white" : "bg-primary text-primary-foreground"
                            )}>
                                <div className="absolute top-0 right-0 -mr-6 -mt-6 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
                                <div className="relative z-10 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[3px] opacity-80 mb-2">Take Home Salary</p>
                                        <h2 className="text-4xl font-black italic tracking-tighter tabular-nums">₹ {actualPayout.toLocaleString()}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[40px] border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden group">
                    <CardHeader className="bg-muted/20 border-b">
                        <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight italic text-emerald-600">
                            <ReceiptIndianRupee className="h-5 w-5" /> Tax Summary (TDS)
                        </CardTitle>
                        <CardDescription>Projected income tax implications.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                         <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-amber-700">Selected Regime</span>
                                <Badge className="bg-amber-500 text-white border-none text-[10px] font-black uppercase">NEW REGIME</Badge>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold text-muted-foreground">
                                    <span>Annual Projection</span>
                                    <span>₹ {(calculation.totalEarnings * 12).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-black text-foreground">
                                    <span>Monthly TDS</span>
                                    <span>₹ {calculation.statutory?.tds || 0}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                Tax is estimated based on current earnings and declarations. Final tax may vary.
                            </p>
                         </div>
                         
                         <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200">
                            <div className="flex items-center gap-3 text-emerald-600 mb-4">
                                <Building className="h-5 w-5" />
                                <span className="font-black uppercase tracking-tighter text-sm">Disbursement Channel</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase">{profile.bankDetails?.bankName || "HDFC Bank"}</p>
                                <p className="text-lg font-black tracking-widest">•••• {profile.bankDetails?.accountNumber?.slice(-4) || "XXXX"}</p>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
