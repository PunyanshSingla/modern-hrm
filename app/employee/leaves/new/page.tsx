"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Calendar, 
    MessageSquare, 
    Send,
    ArrowLeft,
    Clock,
    AlertCircle,
    Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";

export default function NewLeavePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [balances, setBalances] = useState<any[]>([]);
    
    // Form State
    const [formData, setFormData] = useState({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesRes, balRes] = await Promise.all([
                    fetch("/api/employee/leave-types"),
                    fetch("/api/employee/leave-balances")
                ]);
                const [typesData, balData] = await Promise.all([
                    typesRes.json(),
                    balRes.json()
                ]);

                if (typesData.success) setLeaveTypes(typesData.leaveTypes);
                if (balData.success) setBalances(balData.balances);
            } catch (error) {
                toast.error("Failed to load information");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: any) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, leaveTypeId: value }));
    };

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = parseISO(formData.startDate);
        const end = parseISO(formData.endDate);
        const days = differenceInDays(end, start) + 1;
        return days > 0 ? days : 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const days = calculateDays();
        
        if (days <= 0) {
            toast.error("Invalid date range selected");
            return;
        }

        const selectedBalance = balances.find(b => b.leaveTypeId?._id === formData.leaveTypeId);
        if (selectedBalance && selectedBalance.balance < days) {
            toast.error(`Insufficient balance. Available: ${selectedBalance.balance} days`);
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/employee/leaves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Leave application submitted");
                router.push("/employee/leaves");
            } else {
                toast.error(data.error || "Failed to submit request");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const daysRequested = calculateDays();

    if (loading) return <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground hover:text-primary">
                        <Link href="/employee/leaves">
                            <ArrowLeft className="mr-2 h-4 w-4" /> My Leaves
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">Apply <span className="text-primary">Leave</span></h1>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    <Card className="rounded-[40px] border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden border-l-8 border-l-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-tight">
                                <Calendar className="h-6 w-6 text-primary" /> Application Details
                            </CardTitle>
                            <CardDescription>Select your leave type and dates carefully.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type of Absence</Label>
                                <Select onValueChange={handleSelectChange} required>
                                    <SelectTrigger className="rounded-xl border-2 h-12 font-bold focus:ring-primary">
                                        <SelectValue placeholder="Select leave category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        {leaveTypes.map(type => (
                                            <SelectItem key={type._id} value={type._id} className="font-bold">
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">From Date</Label>
                                    <Input id="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="rounded-xl border-2 h-12 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">To Date</Label>
                                    <Input id="endDate" type="date" value={formData.endDate} onChange={handleChange} required className="rounded-xl border-2 h-12 font-bold" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Justification</Label>
                                <Textarea id="reason" value={formData.reason} onChange={handleChange} placeholder="Please provide specific reasoning for your request..." required className="rounded-xl border-2 min-h-[120px] resize-none font-medium italic" />
                            </div>

                            {formData.leaveTypeId && !balances.find(b => b.leaveTypeId?._id === formData.leaveTypeId) && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase italic">
                                    <AlertCircle className="h-4 w-4" />
                                    No balance assigned for this leave type. You cannot apply.
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                disabled={submitting || !!(formData.leaveTypeId && !balances.find(b => b.leaveTypeId?._id === formData.leaveTypeId))} 
                                className="w-full rounded-2xl h-14 font-black uppercase tracking-widest shadow-lg shadow-primary/20 scale-100 active:scale-[0.98] transition-all"
                            >
                                <Send className="mr-2 h-5 w-5" /> {submitting ? "Processing..." : "Submit Application"}
                            </Button>
                        </CardContent>
                    </Card>
                </form>

                <div className="space-y-6">
                    {/* Balance Preview */}
                    <Card className="rounded-[40px] border-muted-foreground/10 bg-muted/20 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase italic tracking-tight">
                                <Clock className="h-5 w-5 text-primary" /> Allowance Check
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {balances.filter(bal => bal.leaveTypeId != null).map(bal => (
                                <div key={bal.leaveTypeId._id} className="flex justify-between items-center p-3 rounded-2xl bg-background/50 border border-border/50">
                                    <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">{bal.leaveTypeId.name}</span>
                                    <Badge variant="secondary" className="font-black text-primary bg-primary/10 border-none px-3">
                                        {bal.balance} Units
                                    </Badge>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-dashed mt-4 flex flex-col items-center gap-2">
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Request Calculation</p>
                                <div className="text-4xl font-black italic text-primary">
                                    {daysRequested} <span className="text-xs uppercase not-italic opacity-60">Days</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Policy Widget */}
                    <Card className="rounded-[32px] border-rose-500/10 bg-rose-500/5 text-rose-600 shadow-sm overflow-hidden">
                        <CardContent className="pt-6 flex gap-3">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest">Notice Period</p>
                                <p className="text-xs font-medium leading-relaxed italic">Applications must be submitted at least 48 hours prior to the start date for proper coordination.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
