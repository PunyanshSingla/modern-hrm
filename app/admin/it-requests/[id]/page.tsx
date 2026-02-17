"use client";

import { useState, useEffect, use } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    Calendar, 
    Laptop, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Clock,
    User,
    Mail,
    Briefcase
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
    const router = useRouter();
    const [request, setRequest] = useState<ITRequest | null>(null);

    const [loading, setLoading] = useState(true);

    // Action State
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequestDetails();
    }, [id]);

    const fetchRequestDetails = async () => {
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
    };

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

    if (loading) return <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!request) return <div className="p-8 text-center">Request not found</div>;

    return (
        <div className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                    <Link href="/admin/it-requests">
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl bg-background hover:bg-muted shadow-sm transition-all hover:scale-105 active:scale-95 border-muted-foreground/10">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tight uppercase">{request.item}</h1>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">{request.type}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground text-sm mt-1 font-medium">
                            <span className="text-primary/70 font-bold">REQ #{request._id.substring(request._id.length - 8).toUpperCase()}</span>
                            <span className="opacity-30">|</span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(request.requestDate), "PPP")}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {request.status === 'Pending' ? (
                        <div className="flex items-center gap-3 p-1.5 bg-muted/50 rounded-[20px] border border-muted-foreground/10">
                            <Button 
                                variant="ghost" 
                                className="rounded-2xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold px-6"
                                onClick={() => setIsRejectDialogOpen(true)}
                                disabled={processing}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button 
                                className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-lg shadow-emerald-500/20"
                                onClick={() => handleStatusUpdate('Approved')}
                                disabled={processing}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </Button>
                        </div>
                    ) : (
                        <Badge className={cn(
                            "text-xs py-2 px-6 rounded-full font-black uppercase tracking-widest shadow-sm",
                            request.status === 'Approved' ? "bg-emerald-500 hover:bg-emerald-600" :
                            request.status === 'Rejected' ? "bg-rose-500 hover:bg-rose-600" :
                            "bg-primary hover:bg-primary/90"
                        )}>
                            {request.status}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Priority</Label>
                                    <div className="mt-1">
                                        <Badge variant="secondary" className={
                                            request.priority === 'High' ? "bg-red-100 text-red-800" :
                                            request.priority === 'Medium' ? "bg-yellow-100 text-yellow-800" :
                                            "bg-blue-100 text-blue-800"
                                        }>
                                            {request.priority}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Category</Label>
                                    <p className="mt-1 font-medium">{request.type}</p>
                                </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                                <Label className="text-muted-foreground">Reason / Justification</Label>
                                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                                    {request.reason}
                                </p>
                            </div>

                            {request.status === 'Rejected' && request.rejectionReason && (
                                <div className="bg-red-50 p-4 rounded-md border border-red-100">
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
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Info</CardTitle>
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
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{request.employeeId.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Briefcase className="h-4 w-4" />
                                    <span>{request.employeeId.department || "No Department"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <Link href={`/admin/employees/${request.employeeId._id}`} className="hover:underline text-primary">
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                             <AlertTriangle className="h-5 w-5" /> Reject Request
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this IT request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                         <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Rejection <span className="text-destructive">*</span></Label>
                            <Textarea 
                                id="reason" 
                                placeholder="E.g. Not in budget, Item currently unavailable..." 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="resize-none focus-visible:ring-destructive"
                            />
                         </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
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
