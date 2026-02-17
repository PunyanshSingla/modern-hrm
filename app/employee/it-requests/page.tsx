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
                <div className="flex flex-col gap-1.5">
                    <span className="font-black uppercase tracking-tight leading-none text-foreground">{row.original.item}</span>
                    <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-tighter h-5 px-2 bg-primary/5 text-primary border-none">{row.original.type}</Badge>
                </div>
            )
        },
        {
            accessorKey: "reason",
            header: "Justification",
            cell: ({ row }) => (
                <p className="text-xs font-medium text-muted-foreground whitespace-pre-wrap break-words max-w-[200px] italic leading-relaxed">
                    "{row.original.reason}"
                </p>
            )
        },
        {
            accessorKey: "requestDate",
            header: "Request Date",
            cell: ({ row }) => (
                <span className="font-bold italic text-sm text-foreground/80">
                    {format(new Date(row.original.requestDate), "MMM d, yyyy")}
                </span>
            )
        },
        {
            accessorKey: "priority",
            header: "Urgency",
            cell: ({ row }) => (
                <Badge variant="secondary" className={cn(
                    "font-black uppercase tracking-widest text-[10px] border-none px-3",
                    row.original.priority === 'High' ? "bg-rose-500/10 text-rose-600" :
                    row.original.priority === 'Medium' ? "bg-amber-500/10 text-amber-600" :
                    "bg-sky-500/10 text-sky-600"
                )}>
                    {row.original.priority}
                </Badge>
            )
        },
        {
            accessorKey: "status",
            header: "Live Status",
            cell: ({ row }) => (
                <div className="flex flex-col gap-2 items-start">
                    <Badge className={cn(
                        "font-black uppercase tracking-widest text-[10px] px-4 py-1 rounded-full border-none shadow-sm",
                        row.original.status === 'Approved' ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                        row.original.status === 'Rejected' ? "bg-rose-500 text-white shadow-rose-500/20" :
                        row.original.status === 'In Progress' ? "bg-sky-500 text-white shadow-sky-500/20" :
                        "bg-amber-500 text-white shadow-amber-500/20"
                    )}>
                        {row.original.status}
                    </Badge>
                    {row.original.status === 'Rejected' && row.original.rejectionReason && (
                        <div className="flex flex-col gap-1 text-[10px] text-rose-600 bg-rose-500/5 p-2 rounded-xl border border-rose-500/10 max-w-[180px]">
                            <span className="font-black uppercase flex items-center gap-1 italic opacity-70">
                                <AlertCircle className="h-3 w-3" /> Note:
                            </span>
                            <span className="font-medium italic">"{row.original.rejectionReason}"</span>
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
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                        <Laptop className="h-3 w-3 mr-2" /> Help Desk
                    </Badge>
                    <h1 className="text-4xl font-black tracking-tight uppercase">IT Requests</h1>
                    <p className="text-muted-foreground font-medium">Request hardware, software, or access permissions from the IT team.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-300">
                            <Plus className="h-5 w-5" /> New Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[32px] border-muted-foreground/10 bg-card/95 backdrop-blur-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Submit IT Request</DialogTitle>
                                <DialogDescription className="font-medium">
                                    Tell us what equipment or digital access you need to be productive.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest ml-1">Request Type</Label>
                                        <Select value={type} onValueChange={setType} required>
                                            <SelectTrigger className="rounded-xl border-2 focus:ring-primary/20">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-2">
                                                <SelectItem value="Hardware">Hardware</SelectItem>
                                                <SelectItem value="Software">Software</SelectItem>
                                                <SelectItem value="Access">Access</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest ml-1">Priority</Label>
                                        <Select value={priority} onValueChange={setPriority} required>
                                            <SelectTrigger className="rounded-xl border-2 focus:ring-primary/20">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-2">
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="item" className="text-[10px] font-black uppercase tracking-widest ml-1">Item / Service Name</Label>
                                    <Input 
                                        id="item" 
                                        placeholder="e.g. MacBook Pro, Jira Access" 
                                        value={item}
                                        onChange={(e) => setItem(e.target.value)}
                                        required
                                        className="rounded-xl border-2 h-12 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-widest ml-1">Reason / Justification</Label>
                                    <Textarea 
                                        id="reason" 
                                        placeholder="Why do you need this?" 
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        className="rounded-xl border-2 h-32 resize-none focus:ring-primary/20 p-4"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                                <Button type="submit" disabled={submitting} className="rounded-xl px-8 font-black uppercase tracking-tight h-12 shadow-lg shadow-primary/20">
                                    {submitting ? "Sending..." : "Submit Request"}
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
