"use client";

import { useState, useEffect, use, useCallback } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { 
    ChevronLeft, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Clock,
    User,
    Mail,
    Briefcase,
    Package
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ITRequest {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        department?: string;
        departmentId?: { name: string };
        position?: string;
        jobTitle?: string;
    };
    type: string;
    item: string;
    reason: string;
    priority: string;
    status: string;
    rejectionReason?: string;
    requestDate: string;
}

export default function ITRequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [request, setRequest] = useState<ITRequest | null>(null);

    const [loading, setLoading] = useState(true);

    // Action State
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const fetchRequestDetails = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/it-requests/${id}`);
            const data = await res.json();
            if (data.success) {
                setRequest(data.request);
            } else {
                toast.error(data.error || "Failed to fetch request details");
            }
        } catch (error) {
            console.error("Error details:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRequestDetails();
    }, [fetchRequestDetails]);

    const handleStatusUpdate = async (status: 'Approved' | 'Rejected', reason?: string) => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/it-requests/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    status,
                    rejectionReason: reason 
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(`Request ${status} successfully`);
                setRequest(data.request);
                if (status === 'Rejected') {
                    setIsRejectDialogOpen(false);
                    setRejectionReason("");
                }
            } else {
                toast.error(data.error || "Failed to update request");
            }
        } catch (error) {
            console.error("Error updating request:", error);
            toast.error("An error occurred");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-muted-foreground">Loading...</div>;
    if (!request) return <div>Request not found</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <Link href="/admin/it-requests">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{request.item}</h1>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{request.type}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-2 font-medium">
                            {request.employeeId.firstName} {request.employeeId.lastName} requested this on {format(new Date(request.requestDate), "PPP")}.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {request.status === 'Pending' ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button 
                                variant="outline" 
                                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setIsRejectDialogOpen(true)}
                                disabled={processing}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleStatusUpdate('Approved')}
                                disabled={processing}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </Button>
                        </div>
                    ) : (
                        <Badge className={cn(
                            request.status === 'Approved' ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-100" :
                            request.status === 'Rejected' ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-100" :
                            "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100"
                        )}>
                            {request.status}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Priority"
                    value={request.priority}
                    description="Request urgency"
                    icon={AlertTriangle}
                    className={request.priority === "High" ? "border-destructive/30" : undefined}
                />
                <StatsCard
                    title="Status"
                    value={request.status}
                    description={`Req #${request._id.substring(request._id.length - 8).toUpperCase()}`}
                    icon={Clock}
                />
                <StatsCard
                    title="Request Type"
                    value={request.type}
                    description={format(new Date(request.requestDate), "MMM d, yyyy")}
                    icon={Package}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-2xl border border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Request Information</CardTitle>
                            <CardDescription>Item details and request context</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</Label>
                                    <div className="mt-2">
                                        <Badge variant="secondary" className={
                                            request.priority === 'High' ? "bg-red-100 text-red-800" :
                                            request.priority === 'Medium' ? "bg-yellow-100 text-yellow-800" :
                                            "bg-blue-100 text-blue-800"
                                        }>
                                            {request.priority}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Request Type</Label>
                                    <p className="mt-2 font-semibold">{request.type}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-foreground">Reason</Label>
                                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                    <p className="text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
                                        {request.reason}
                                    </p>
                                </div>
                            </div>

                            {request.status === 'Rejected' && request.rejectionReason && (
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200 dark:bg-red-900/10 dark:border-red-900/50">
                                    <Label className="text-red-800 font-semibold flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Rejection Reason
                                    </Label>
                                    <p className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                                        {request.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-2xl border border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Employee</CardTitle>
                            <CardDescription>Requester and contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold" title={`${request.employeeId.firstName || ''} ${request.employeeId.lastName || ''}`.trim() || 'Employee'}>
                                        {request.employeeId.firstName?.[0]?.toUpperCase() || ''}{request.employeeId.lastName?.[0]?.toUpperCase() || (!request.employeeId.firstName?.[0] ? '?' : '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{request.employeeId.firstName} {request.employeeId.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{request.employeeId.jobTitle || "Employee"}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3 text-sm font-medium">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{request.employeeId.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Briefcase className="h-4 w-4" />
                                    <span>{request.employeeId.departmentId?.name || request.employeeId.department || "No Department"}</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full justify-between" asChild>
                                <Link href={`/admin/employees/${request.employeeId._id}`}>
                                    View Full Profile
                                    <User className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-destructive">
                             <AlertTriangle className="h-4 w-4" /> Reject Request
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Please provide a reason for rejecting this IT request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                         <div className="space-y-1.5">
                            <Label htmlFor="reason" className="text-xs font-semibold">Reason for Rejection <span className="text-destructive">*</span></Label>
                            <Textarea 
                                id="reason" 
                                placeholder="E.g. Not in budget, Item currently unavailable..." 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="h-28 text-xs border-muted-foreground/60 focus:border-destructive shadow-none resize-none rounded-lg"
                            />
                         </div>
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            size="sm"
                            className="h-9 text-xs"
                            onClick={() => handleStatusUpdate('Rejected', rejectionReason)}
                            disabled={!rejectionReason.trim() || processing}
                        >
                            {processing ? "Rejecting..." : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
