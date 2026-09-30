"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Laptop, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ITRequest {
    _id: string;
    type: string;
    item: string;
    reason: string;
    priority: string;
    status: string;
    rejectionReason?: string;
    requestDate: string;
}

export default function ITRequestsPage() {
    const [requests, setRequests] = useState<ITRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [type, setType] = useState("");
    const [item, setItem] = useState("");
    const [reason, setReason] = useState("");
    const [priority, setPriority] = useState("Medium");

    const columns: ColumnDef<ITRequest>[] = [
        {
            accessorKey: "item",
            header: "Requested Item",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">{row.original.item}</span>
                    <Badge variant="outline" className="text-[11px] font-medium bg-muted/60 text-foreground border-border/50">{row.original.type}</Badge>
                </div>
            )
        },
        {
            accessorKey: "reason",
            header: "Justification",
            cell: ({ row }) => (
                <p className="text-xs font-normal text-muted-foreground truncate max-w-[220px]" title={row.original.reason}>
                    "{row.original.reason}"
                </p>
            )
        },
        {
            accessorKey: "requestDate",
            header: "Request Date",
            cell: ({ row }) => (
                <span className="font-semibold text-xs text-foreground">
                    {format(new Date(row.original.requestDate), "MMM d, yyyy")}
                </span>
            )
        },
        {
            accessorKey: "priority",
            header: "Urgency",
            cell: ({ row }) => (
                <Badge variant="outline" className={cn(
                    "text-xs font-medium px-2.5 py-0.5 border capitalize",
                    row.original.priority === 'High' ? "bg-rose-500/10 text-rose-700 border-rose-500/20" :
                    row.original.priority === 'Medium' ? "bg-amber-500/10 text-amber-700 border-amber-500/20" :
                    "bg-sky-500/10 text-sky-700 border-sky-500/20"
                )}>
                    {row.original.priority}
                </Badge>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex flex-col gap-1 items-start">
                    <Badge variant="outline" className={cn(
                        "text-xs font-medium px-2.5 py-0.5 border capitalize",
                        row.original.status === 'Approved' ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
                        row.original.status === 'Rejected' ? "bg-rose-500/10 text-rose-700 border-rose-500/20" :
                        row.original.status === 'In Progress' ? "bg-sky-500/10 text-sky-700 border-sky-500/20" :
                        "bg-amber-500/10 text-amber-700 border-amber-500/20"
                    )}>
                        {row.original.status}
                    </Badge>
                    {row.original.status === 'Rejected' && row.original.rejectionReason && (
                        <div className="flex items-center gap-1 text-[11px] text-rose-600 max-w-[180px] truncate" title={row.original.rejectionReason}>
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span>"{row.original.rejectionReason}"</span>
                        </div>
                    )}
                </div>
            )
        }
    ];

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/employee/it-requests");
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests || []);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/employee/it-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    item,
                    reason,
                    priority
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("IT Request submitted successfully");
                setIsDialogOpen(false);
                // Reset form
                setType("");
                setItem("");
                setReason("");
                setPriority("Medium");
                // Refresh list
                fetchRequests();
            } else {
                toast.error(data.error || "Failed to submit request");
            }
        } catch (error) {
            console.error("Error submitting request:", error);
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">IT Support Requests</h1>
                    <p className="text-xs text-muted-foreground mt-1 font-normal">Request hardware, software, or digital access permissions from IT administration.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 text-xs font-medium gap-1.5 rounded-lg shadow-xs">
                            <Plus className="h-3.5 w-3.5" /> New Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[85vh] overflow-y-auto rounded-xl border shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle className="text-sm font-semibold text-foreground">Submit IT Request</DialogTitle>
                                <DialogDescription className="text-xs">
                                    Specify the IT hardware, software, or digital permission required.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="type" className="text-xs font-medium text-muted-foreground">Request Type</Label>
                                        <Select value={type} onValueChange={setType} required>
                                            <SelectTrigger className="w-full h-9 border-border text-xs rounded-lg shadow-xs font-medium">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border shadow-md">
                                                <SelectItem value="Hardware" className="text-xs font-medium cursor-pointer">Hardware</SelectItem>
                                                <SelectItem value="Software" className="text-xs font-medium cursor-pointer">Software</SelectItem>
                                                <SelectItem value="Access" className="text-xs font-medium cursor-pointer">Access</SelectItem>
                                                <SelectItem value="Other" className="text-xs font-medium cursor-pointer">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="priority" className="text-xs font-medium text-muted-foreground">Priority</Label>
                                        <Select value={priority} onValueChange={setPriority} required>
                                            <SelectTrigger className="w-full h-9 border-border text-xs rounded-lg shadow-xs font-medium">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border shadow-md">
                                                <SelectItem value="Low" className="text-xs font-medium cursor-pointer">Low</SelectItem>
                                                <SelectItem value="Medium" className="text-xs font-medium cursor-pointer">Medium</SelectItem>
                                                <SelectItem value="High" className="text-xs font-medium cursor-pointer">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="item" className="text-xs font-medium text-muted-foreground">Item / Service Name</Label>
                                    <Input 
                                        id="item" 
                                        placeholder="e.g. MacBook Pro, Jira Access" 
                                        value={item}
                                        onChange={(e) => setItem(e.target.value)}
                                        required
                                        className="h-9 text-xs border-border shadow-xs font-medium rounded-lg"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="reason" className="text-xs font-medium text-muted-foreground">Reason / Justification</Label>
                                    <Textarea 
                                        id="reason" 
                                        placeholder="Why do you need this equipment or access?" 
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        className="text-xs border-border shadow-xs h-24 resize-none rounded-lg font-medium"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="submit" disabled={submitting} className="w-full h-9 text-xs font-medium rounded-lg shadow-xs">
                                    {submitting ? "Submitting..." : "Submit Request"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable 
                columns={columns} 
                data={requests} 
                loading={loading}
                searchKey="item"
            />
        </div>
    );
}
