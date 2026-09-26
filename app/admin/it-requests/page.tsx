"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Search,
    ExternalLink
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { ColumnDef } from "@tanstack/react-table";
import SearchInput from "@/components/SearchInput";

interface ITRequest {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        department?: string;
        position?: string;
    };
    type: string;
    item: string;
    reason: string;
    priority: string;
    status: string;
    rejectionReason?: string;
    requestDate: string;
}

export default function AdminITRequestsPage() {
    const [requests, setRequests] = useState<ITRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Rejection State
    const [selectedRequest, setSelectedRequest] = useState<ITRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/it-requests");
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests || []);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId: string, status: 'Approved' | 'Rejected', reason?: string) => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/it-requests/${requestId}`, {
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
                setRequests(prev => prev.map(req =>
                    req._id === requestId ? { ...req, status, rejectionReason: reason } : req
                ));

                if (status === 'Rejected') {
                    setIsRejectDialogOpen(false);
                    setRejectionReason("");
                    setSelectedRequest(null);
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

    const openRejectDialog = (request: ITRequest) => {
        setSelectedRequest(request);
        setRejectionReason("");
        setIsRejectDialogOpen(true);
    };

    const columns = useMemo<ColumnDef<ITRequest>[]>(() => [
        {
            accessorFn: (row) => `${row.employeeId?.firstName} ${row.employeeId?.lastName}`,
            id: "employee",
            header: "Employee",
            cell: ({ row }) => {
                const emp = row.original.employeeId;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {emp?.firstName?.[0] || ""}{emp?.lastName?.[0] || ""}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="font-medium text-sm">
                                {emp?.firstName} {emp?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {emp?.email}
                            </p>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "item",
            header: "Request Details",
            cell: ({ row }) => {
                const req = row.original;
                return (
                    <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">{req.type}</Badge>
                            <Link href={`/admin/it-requests/${req._id}`} className="font-medium text-sm hover:underline text-primary">
                                {req.item}
                            </Link>
                        </div>
                        {req.status === 'Rejected' && req.rejectionReason && (
                            <p className="text-xs text-red-500 italic max-w-[200px] truncate">
                                Reason: {req.rejectionReason}
                            </p>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "requestDate",
            header: "Date",
            cell: ({ row }) => format(new Date(row.getValue("requestDate")), "MMM d, yyyy")
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = row.getValue("priority") as string;
                return (
                    <Badge variant="secondary" className={
                        priority === 'High' ? "bg-red-100 text-red-800" :
                            priority === 'Medium' ? "bg-yellow-100 text-yellow-800" :
                                "bg-blue-100 text-blue-800"
                    }>
                        {priority}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge className={
                        status === 'Approved' ? "bg-green-500" :
                            status === 'Rejected' ? "bg-red-500" :
                                status === 'In Progress' ? "bg-blue-500" :
                                    "bg-yellow-500"
                    }>
                        {status}
                    </Badge>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const req = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <Link href={`/admin/it-requests/${req._id}`}>
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </Button>
                        {req.status === 'Pending' && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => handleStatusUpdate(req._id, 'Approved')}
                                    disabled={processing}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => openRejectDialog(req)}
                                    disabled={processing}
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                );
            }
        }
    ], [processing]);

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const term = searchQuery.toLowerCase();
            const fullName = `${req.employeeId?.firstName} ${req.employeeId?.lastName}`.toLowerCase();
            return fullName.includes(term) ||
                req.item.toLowerCase().includes(term) ||
                req.type.toLowerCase().includes(term);
        });
    }, [requests, searchQuery]);

    // Stats Logic
    const pendingRequests = requests.filter(r => r.status === 'Pending').length;
    const highPriority = requests.filter(r => r.priority === 'High' && r.status === 'Pending').length;
    const totalRequests = requests.length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">IT Support Requests</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Manage hardware and software requests from employees.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Pending Requests"
                    value={pendingRequests}
                    description="Total requests waiting"
                    icon={Clock}
                    loading={loading}
                />
                <StatsCard
                    title="Urgent Requests"
                    value={highPriority}
                    description="High priority waiting"
                    icon={AlertTriangle}
                    loading={loading}
                />
                <StatsCard
                    title="Success Rate"
                    value={totalRequests > 0 ? `${(((totalRequests - pendingRequests) / totalRequests) * 100).toFixed(1)}%` : "100%"}
                    description="Request completion rate"
                    icon={CheckCircle}
                    loading={loading}
                />
            </div>

            {/* Main Content Area */}
                <div className="overflow-hidden">
                    <DataTable
                        columns={columns}
                        searchTerm={searchQuery}
                        setSearchTerm={setSearchQuery}
                        data={filteredRequests}
                        loading={loading}
                    />
                </div>

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
                        <div className="bg-muted/20 p-3 rounded-lg text-xs border space-y-1">
                            <span className="font-semibold text-muted-foreground uppercase text-[10px]">Request Item</span>
                            <p className="font-bold text-sm text-foreground">{selectedRequest?.item}</p>
                            <p className="text-muted-foreground text-xs">
                                Requested by {selectedRequest?.employeeId?.firstName} {selectedRequest?.employeeId?.lastName}
                            </p>
                        </div>
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
                            onClick={() => selectedRequest && handleStatusUpdate(selectedRequest._id, 'Rejected', rejectionReason)}
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
