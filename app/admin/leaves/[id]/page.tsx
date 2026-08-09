"use client";

import { useState, useEffect, use, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Calendar, 
    FileText, 
    Clock, 
    Mail, 
    Phone, 
    Building, 
    AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { format, differenceInCalendarDays } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

export default function LeaveDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [leave, setLeave] = useState<Leave | null>(null);

    const [loading, setLoading] = useState(true);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    const fetchLeave = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/leaves/${id}`);
            const data = await res.json();
            if (data.success) {
                setLeave(data.leave);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error fetching leave details", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchLeave();
    }, [fetchLeave]);

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
        <div className="text-muted-foreground">Loading...</div>
    );

    if (!leave) return (
        <div className="text-muted-foreground">
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
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <Link href="/admin/leaves">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">Leave Request</h1>
                            <Badge variant={
                                leave.status === 'Approved' ? 'default' :
                                leave.status === 'Rejected' ? 'destructive' : 'secondary'
                            } className={cn(
                                leave.status === 'Approved' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-100' :
                                leave.status === 'Rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-100' :
                                'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100'
                            )}>
                                {leave.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-2 font-medium">
                            {leave.employeeId.firstName} {leave.employeeId.lastName} requested {leave.leaveTypeId?.name || "leave"} on {format(new Date(leave.createdAt), "PPP")}.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Leave Type"
                    value={leave.leaveTypeId?.name || "Unknown"}
                    description={`Case #${leave._id.slice(-6).toUpperCase()}`}
                    icon={FileText}
                />
                <StatsCard
                    title="Duration"
                    value={`${duration} days`}
                    description={`${format(new Date(leave.startDate), "MMM d")} - ${format(new Date(leave.endDate), "MMM d, yyyy")}`}
                    icon={Calendar}
                />
                <StatsCard
                    title="Balance"
                    value={currentBalance}
                    description={hasEnoughBalance ? "Available for this type" : "Insufficient balance"}
                    icon={Clock}
                    className={!hasEnoughBalance ? "border-destructive/30" : undefined}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: Employee & Balance (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Employee Card */}
                        <Card className="rounded-2xl border border-border/60 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold">Employee</CardTitle>
                                <CardDescription>Request owner and contact details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {leave.employeeId.firstName?.[0] || '?'}{leave.employeeId.lastName?.[0] || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-xl font-bold">{leave.employeeId.firstName} {leave.employeeId.lastName}</h2>
                                        <p className="text-sm text-muted-foreground font-medium">{leave.employeeId.jobTitle || 'No Title'}</p>
                                    </div>
                                </div>

                                <Separator className="my-5" />

                                <div className="space-y-4">
                                    <div className="space-y-3 text-sm font-medium">
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
                                    
                                    <Button variant="outline" className="w-full justify-between" asChild>
                                        <Link href={`/admin/employees/${leave.employeeId._id}`}>
                                            View Full Profile 
                                            <ArrowLeft className="h-4 w-4 rotate-180" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Balances Card */}
                        <Card className="rounded-2xl border border-border/60 shadow-sm">
                             <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-lg font-semibold">Leave Balances</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {leave.employeeId.leaveBalances && leave.employeeId.leaveBalances.filter(b => b.leaveTypeId).length > 0 ? (
                                    <div className="space-y-4">
                                        {leave.employeeId.leaveBalances.filter(b => b.leaveTypeId).map((item, index, filteredArr) => (
                                            <div key={index}>
                                                <div className="flex justify-between items-center py-2">
                                                    <span className={`text-sm font-medium ${item.leaveTypeId?._id === leave.leaveTypeId?._id ? 'text-primary' : 'text-muted-foreground'}`}>
                                                        {item.leaveTypeId?.name || 'Unknown Type'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="bg-background">{item.balance}</Badge>
                                                    </div>
                                                </div>
                                                {index < filteredArr.length - 1 && <Separator className="opacity-50" />}
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
                        <Card className="rounded-2xl border border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Request Overview</CardTitle>
                                <CardDescription>Key details about the leave application</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Leave Type</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: leave.leaveTypeId?.color || '#ccc' }}></div>
                                            <p className="font-semibold text-foreground">{leave.leaveTypeId?.name || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Duration</span>
                                        <div className="flex items-baseline gap-1">
                                            <p className="font-semibold text-foreground">{duration}</p>
                                            <span className="text-sm font-medium text-muted-foreground">Days</span>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date Range</span>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{format(new Date(leave.startDate), "MMM d, yyyy")}</span>
                                            <span className="text-xs text-muted-foreground my-0.5">to</span>
                                            <span className="font-semibold text-foreground">{format(new Date(leave.endDate), "MMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-foreground">Reason for Leave</h3>
                                    <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                        <p className="text-sm leading-7 text-muted-foreground">
                                            {leave.reason}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Area */}
                        {leave.status === 'Pending' && (
                            <Card className="rounded-2xl border border-border/60 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold">Manager Action</CardTitle>
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
                            <Card className="rounded-2xl border-destructive/30 bg-destructive/5 shadow-sm">
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
                             <Card className="rounded-2xl border-green-600/30 bg-green-50 dark:bg-green-900/10 shadow-sm">
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
    );
}
