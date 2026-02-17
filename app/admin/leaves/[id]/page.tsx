"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Calendar, 
    User, 
    FileText, 
    Clock, 
    Mail, 
    Phone, 
    Building, 
    Briefcase,
    AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { format, differenceInCalendarDays } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface LeaveType {
    _id: string;
    name: string;
    color: string;
}

interface Leave {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        userId?: { email: string };
        email?: string;
        phone?: string;
        mobile?: string;
        departmentId?: { name: string };
        jobTitle?: string;
        leaveBalances?: {
            leaveTypeId: LeaveType;
            balance: number;
        }[];
    };
    leaveTypeId: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
    rejectionReason?: string;
}

interface LeaveHistoryItem {
    _id: string;
    leaveTypeId: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
}

export default function LeaveDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [leave, setLeave] = useState<Leave | null>(null);

    const [loading, setLoading] = useState(true);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    const fetchLeave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/leaves/${id}`);
            const data = await res.json();
            if (data.success) {
                setLeave(data.leave);
                setLeave(data.leave);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error fetching leave details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeave();
    }, [id]);

    const handleUpdateStatus = async (status: 'Approved' | 'Rejected') => {
        if (status === 'Rejected' && !rejectionReason && isRejecting) {
            alert("Please provide a reason for rejection.");
            return;
        }

        if (status === 'Rejected' && !isRejecting) {
            setIsRejecting(true);
            return;
        }

        try {
            const res = await fetch(`/api/admin/leaves/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    status,
                    rejectionReason: status === 'Rejected' ? rejectionReason : undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                setLeave(data.leave);
                setIsRejecting(false);
            } else {
                alert(data.error);
            }
        } catch (error) {
             console.error("Error updating leave status", error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!leave) return (
        <div className="p-8 text-center text-muted-foreground">
            Leave request not found. 
            <Button variant="link" onClick={() => router.push('/admin/leaves')}>Go back</Button>
        </div>
    );

    const duration = differenceInCalendarDays(new Date(leave.endDate), new Date(leave.startDate)) + 1;
    
    // Determine which balance to highlight
    const relevantBalanceObj = leave.employeeId.leaveBalances?.find(b => b.leaveTypeId?._id === leave.leaveTypeId?._id);
    const currentBalance = relevantBalanceObj ? relevantBalanceObj.balance : 0;
    const hasEnoughBalance = currentBalance >= duration;
    
    const employeeEmail = leave.employeeId.userId?.email || leave.employeeId.email || "No Email";

    return (
        <div className="h-full bg-muted/20 p-6 md:p-8 font-sans animate-in fade-in duration-700">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                        <Link href="/admin/leaves">
                            <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl bg-background hover:bg-muted shadow-sm transition-all hover:scale-105 active:scale-95 border-muted-foreground/10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Leave Request</h1>
                                <Badge variant={
                                    leave.status === 'Approved' ? 'default' :
                                    leave.status === 'Rejected' ? 'destructive' : 'secondary'
                                } className={cn(
                                    "text-[10px] px-3 py-1 uppercase tracking-widest font-black shadow-sm rounded-full",
                                    leave.status === 'Approved' ? 'bg-emerald-500 hover:bg-emerald-600' :
                                    leave.status === 'Rejected' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-primary'
                                )}>
                                    {leave.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1 font-medium">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    Requested on {format(new Date(leave.createdAt), "PPP")}
                                </span>
                                <span className="opacity-30">|</span>
                                <span className="text-primary font-bold">CASE #{leave._id.slice(-6).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Employee & Balance (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Employee Card */}
                        <Card className="shadow-sm border-border/60 overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b"></div>
                            <CardContent className="pt-0 relative">
                                <div className="absolute -top-12 left-6">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                                            {leave.employeeId.firstName?.[0] || '?'}{leave.employeeId.lastName?.[0] || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="mt-14 space-y-4">
                                    <div>
                                        <h2 className="text-xl font-bold">{leave.employeeId.firstName} {leave.employeeId.lastName}</h2>
                                        <p className="text-sm text-muted-foreground font-medium">{leave.employeeId.jobTitle || 'No Title'}</p>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Building className="h-4 w-4 shrink-0 text-foreground/70" />
                                            <span className="truncate">{leave.employeeId.departmentId?.name || "No Department"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Mail className="h-4 w-4 shrink-0 text-foreground/70" />
                                            <span className="truncate" title={employeeEmail}>{employeeEmail}</span>
                                        </div>
                                        {(leave.employeeId.phone || leave.employeeId.mobile) && (
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <Phone className="h-4 w-4 shrink-0 text-foreground/70" />
                                                <span>{leave.employeeId.phone || leave.employeeId.mobile}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Button variant="outline" className="w-full justify-between group" asChild>
                                        <Link href={`/admin/employees/${leave.employeeId._id}`}>
                                            View Full Profile 
                                            <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Balances Card */}
                        <Card className="shadow-sm border-border/60">
                             <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-primary" />
                                    Leave Balances
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {leave.employeeId.leaveBalances && leave.employeeId.leaveBalances.length > 0 ? (
                                    <div className="space-y-4">
                                        {leave.employeeId.leaveBalances.map((item, index) => (
                                            <div key={index}>
                                                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                    <span className={`text-sm font-medium ${item.leaveTypeId?._id === leave.leaveTypeId?._id ? 'text-primary' : 'text-muted-foreground'}`}>
                                                        {item.leaveTypeId?.name || 'Unknown Type'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="bg-background">{item.balance}</Badge>
                                                    </div>
                                                </div>
                                                {index < (leave.employeeId.leaveBalances?.length || 0) - 1 && <Separator className="opacity-50" />}
                                            </div>
                                        ))}
                                        
                                        {!hasEnoughBalance && (
                                            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-start gap-3 mt-4">
                                                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-destructive">Insufficient Balance</p>
                                                    <p className="text-xs text-destructive/80 leading-relaxed">
                                                        Requesting <strong>{duration} days</strong> surpasses the available <strong>{currentBalance}</strong> days for {leave.leaveTypeId?.name || 'this leave type'}.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No balance info available. 
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Details & Actions (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="shadow-sm border-border/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Request Overview
                                </CardTitle>
                                <CardDescription>Key details about the leave application</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-muted/40 border border-border/40">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leave Type</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: leave.leaveTypeId?.color || '#ccc' }}></div>
                                            <p className="text-lg font-bold text-foreground">{leave.leaveTypeId?.name || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-muted/40 border border-border/40">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Duration</span>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-lg font-bold text-foreground">{duration}</p>
                                            <span className="text-sm font-medium text-muted-foreground">Days</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-muted/40 border border-border/40">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Range</span>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{format(new Date(leave.startDate), "MMM d, yyyy")}</span>
                                            <span className="text-xs text-muted-foreground my-0.5">to</span>
                                            <span className="font-semibold text-foreground">{format(new Date(leave.endDate), "MMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Reason for Leave
                                    </h3>
                                    <div className="p-6 rounded-xl border border-border/60 bg-muted/20 relative">
                                        <FileText className="absolute top-6 left-6 h-10 w-10 text-muted-foreground/10" />
                                        <p className="text-sm leading-7 text-muted-foreground relative z-10 italic">
                                            "{leave.reason}"
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Area */}
                        {leave.status === 'Pending' && (
                            <Card className="border-primary/20 shadow-md bg-gradient-to-b from-primary/5 to-background">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                                        Manager Action
                                    </CardTitle>
                                    <CardDescription>
                                        Review the request details and employee balance before taking action.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    {isRejecting ? (
                                        <div className="space-y-4 p-4 border border-destructive/20 rounded-lg bg-background animate-in fade-in zoom-in-95 duration-200">
                                            <div className="space-y-2">
                                                <Label htmlFor="rejection-reason" className="text-destructive font-medium flex items-center gap-2">
                                                     <AlertTriangle className="h-4 w-4" /> Reason for Rejection
                                                </Label>
                                                <Textarea 
                                                    id="rejection-reason"
                                                    placeholder="Please provide a clear reason for rejecting this request..."
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    className="focus-visible:ring-destructive resize-none"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 justify-end">
                                                <Button 
                                                    variant="ghost" 
                                                    onClick={() => setIsRejecting(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button 
                                                    onClick={() => handleUpdateStatus('Rejected')} 
                                                    variant="destructive"
                                                    disabled={!rejectionReason.trim()}
                                                >
                                                    Confirm Rejection
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                            <Button 
                                                onClick={() => setIsRejecting(true)} 
                                                variant="outline"
                                                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" /> Reject
                                            </Button>
                                            <Button 
                                                onClick={() => handleUpdateStatus('Approved')} 
                                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" /> Approve Request
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}


                        {leave.status === 'Rejected' && leave.rejectionReason && (
                            <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-destructive text-base flex items-center gap-2">
                                        <XCircle className="h-4 w-4" /> Rejection Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-destructive/90 bg-background/50 p-4 rounded-lg border border-destructive/10">
                                        {leave.rejectionReason}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        
                        {leave.status === 'Approved' && (
                             <Card className="border-green-600/30 bg-green-50 dark:bg-green-900/10 shadow-sm">
                                <CardContent className="py-8 flex flex-col items-center gap-3 justify-center text-green-700 dark:text-green-400 font-medium">
                                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-1">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <p className="text-lg">Request Approved</p>
                                    <p className="text-sm opacity-80 font-normal">Action taken by Admin</p>
                                </CardContent>
                            </Card>
                        )}


                    </div>
                </div>
            </div>
        </div>
    );
}
