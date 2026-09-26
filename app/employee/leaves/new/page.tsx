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
import { Skeleton } from "@/components/ui/skeleton";
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
import { differenceInDays, parseISO, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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

    if (loading) return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-border/60 pb-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 rounded-lg" />
                    <Skeleton className="h-4 w-48 rounded opacity-50" />
                </div>
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
            <Card className="p-6 space-y-4">
                <Skeleton className="h-6 w-40 rounded opacity-70" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-10 w-full rounded-lg opacity-40" />
                    <Skeleton className="h-10 w-full rounded-lg opacity-40" />
                </div>
                <Skeleton className="h-24 w-full rounded-xl opacity-40" />
            </Card>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-1 -ml-2 text-muted-foreground hover:text-primary h-7 text-xs font-medium">
                        <Link href="/employee/leaves">
                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to My Leaves
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Apply for Leave</h1>
                    <p className="text-xs text-muted-foreground mt-0.5 font-normal">Submit a new leave request for administrative review.</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    <Card className="rounded-xl border border-border shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                                <Calendar className="h-4 w-4 text-primary" /> Application Details
                            </CardTitle>
                            <CardDescription className="text-xs">Select your leave category and requested dates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Type of Leave</Label>
                                <Select onValueChange={handleSelectChange} required>
                                    <SelectTrigger className="rounded-lg border-border h-9 text-xs font-medium shadow-xs">
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border shadow-md">
                                        {leaveTypes.map(type => (
                                            <SelectItem key={type._id} value={type._id} className="text-xs font-medium">
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">From Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-9 text-xs justify-start text-left font-medium rounded-lg border-border shadow-xs",
                                                    !formData.startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <Calendar className="mr-2 h-3.5 w-3.5" />
                                                {formData.startDate ? format(new Date(formData.startDate), "MMM d, yyyy") : <span>Pick start date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-xl border shadow-md" align="start">
                                            <CalendarPicker
                                                mode="single"
                                                selected={formData.startDate ? new Date(formData.startDate) : undefined}
                                                onSelect={(d) => setFormData(prev => ({ ...prev, startDate: d ? format(d, "yyyy-MM-dd") : "" }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">To Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-9 text-xs justify-start text-left font-medium rounded-lg border-border shadow-xs",
                                                    !formData.endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <Calendar className="mr-2 h-3.5 w-3.5" />
                                                {formData.endDate ? format(new Date(formData.endDate), "MMM d, yyyy") : <span>Pick end date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-xl border shadow-md" align="start">
                                            <CalendarPicker
                                                mode="single"
                                                selected={formData.endDate ? new Date(formData.endDate) : undefined}
                                                onSelect={(d) => setFormData(prev => ({ ...prev, endDate: d ? format(d, "yyyy-MM-dd") : "" }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="reason" className="text-xs font-medium text-muted-foreground">Reason for Absence</Label>
                                <Textarea id="reason" value={formData.reason} onChange={handleChange} placeholder="Provide specific reason for your request..." required className="rounded-lg min-h-[90px] text-xs font-medium resize-none shadow-xs" />
                            </div>

                            {formData.leaveTypeId && !balances.find(b => b.leaveTypeId?._id === formData.leaveTypeId) && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-medium">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    No balance assigned for this leave type. You cannot submit an application.
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={submitting || !!(formData.leaveTypeId && !balances.find(b => b.leaveTypeId?._id === formData.leaveTypeId))} 
                                    className="rounded-lg h-9 px-6 text-xs font-medium shadow-xs gap-1.5"
                                >
                                    <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : "Submit Application"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                <div className="space-y-6">
                    {/* Balance Preview */}
                    <Card className="rounded-xl border border-border shadow-xs bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <Clock className="h-4 w-4 text-primary" /> Leave Allowance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {balances.filter(bal => bal.leaveTypeId != null).map(bal => (
                                <div key={bal.leaveTypeId._id} className="flex justify-between items-center p-2.5 rounded-lg bg-muted/30 border border-border/60">
                                    <span className="text-xs font-medium text-foreground">{bal.leaveTypeId.name}</span>
                                    <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                                        {bal.balance} Days Left
                                    </Badge>
                                </div>
                            ))}
                            <div className="pt-3 border-t border-border/60 mt-3 flex flex-col items-center gap-1">
                                <p className="text-[11px] font-medium text-muted-foreground">Requested Duration</p>
                                <div className="text-2xl font-bold text-foreground">
                                    {daysRequested} <span className="text-xs font-normal text-muted-foreground">Days</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Policy Widget */}
                    <Card className="rounded-xl border border-border/60 bg-muted/30 shadow-xs">
                        <CardContent className="p-4 flex gap-3">
                            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-foreground">Leave Notice Policy</p>
                                <p className="text-xs font-normal text-muted-foreground leading-relaxed">Please submit leave applications at least 48 hours in advance for timely manager approval.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
