"use client";

import { useState, useEffect } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LeaveRequest {
    _id: string;
    leaveTypeId: {
        name: string;
    };
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
}

export default function EmployeeLeavesPage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const columns: ColumnDef<LeaveRequest>[] = [
        {
            accessorKey: "leaveTypeId.name",
            header: "Type",
            cell: ({ row }) => (
                row.original.leaveTypeId ? (
                    <Badge 
                        variant="secondary" 
                        className="font-bold uppercase tracking-tighter"
                    >
                        {row.original.leaveTypeId.name}
                    </Badge>
                ) : (
                    <Badge variant="outline">Unknown Type</Badge>
                )
            )
        },
        {
            accessorKey: "startDate",
            header: "Dates",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold">{format(new Date(row.original.startDate), "MMM d, yyyy")}</span>
                    <span className="text-muted-foreground text-xs font-medium">to {format(new Date(row.original.endDate), "MMM d, yyyy")}</span>
                </div>
            )
        },
        {
            id: "duration",
            header: "Duration",
            cell: ({ row }) => {
                const start = new Date(row.original.startDate);
                const end = new Date(row.original.endDate);
                const duration = differenceInCalendarDays(end, start) + 1;
                return (
                    <div className="flex items-center gap-2 font-black">
                        <Clock className="h-4 w-4 text-primary" />
                        {duration} Days
                    </div>
                );
            }
        },
        {
            accessorKey: "reason",
            header: "Reason",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate text-sm font-medium text-muted-foreground italic" title={row.original.reason}>
                    "{row.original.reason}"
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="secondary" className={cn(
                    "font-black uppercase tracking-widest text-[10px] px-3 py-1",
                    row.original.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-none' : 
                    row.original.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 border-none' : 
                    'bg-amber-500/10 text-amber-600 border-none'
                )}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Applied On",
            cell: ({ row }) => (
                <span className="text-sm font-bold text-muted-foreground">
                    {format(new Date(row.original.createdAt), "MMM d, yyyy")}
                </span>
            )
        }
    ];

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch("/api/employee/leaves");
            const data = await res.json();
            if (data.success) {
                setLeaves(data.leaves || []);
            }
        } catch (error) {
            console.error("Error fetching leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
                <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                    <Calendar className="h-3 w-3 mr-2" /> Leave Management
                </Badge>
                <h1 className="text-4xl font-black tracking-tight uppercase">My Leaves</h1>
                <p className="text-muted-foreground font-medium">View your leave history and apply for new requests.</p>
            </div>
            <Button asChild className="h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 font-bold transition-all hover:scale-105 active:scale-95">
                <Link href="/employee/leaves/new">
                    <CalendarPlus className="mr-2 h-5 w-5" /> Apply for Leave
                </Link>
            </Button>
        </div>

        <DataTable 
            columns={columns} 
            data={leaves} 
            loading={loading}
            searchKey="leaveTypeId_name"
        />
    </div>
    );
}
