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
            id: "leaveTypeId_name",
            accessorKey: "leaveTypeId.name",
            header: "Type",
            cell: ({ row }) => (
                row.original.leaveTypeId ? (
                    <Badge 
                        variant="secondary" 
                        className="text-[11px] font-medium bg-muted/60 text-foreground border border-border/50 px-2 py-0"
                    >
                        {row.original.leaveTypeId.name}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-[11px] font-medium">Unknown Type</Badge>
                )
            )
        },
        {
            accessorKey: "startDate",
            header: "Dates",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-xs text-foreground">{format(new Date(row.original.startDate), "MMM d, yyyy")}</span>
                    <span className="text-muted-foreground text-[11px] font-normal">to {format(new Date(row.original.endDate), "MMM d, yyyy")}</span>
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
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {duration} Days
                    </div>
                );
            }
        },
        {
            accessorKey: "reason",
            header: "Reason",
            cell: ({ row }) => (
                <div className="max-w-[220px] truncate text-xs font-normal text-muted-foreground" title={row.original.reason}>
                    "{row.original.reason}"
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="outline" className={cn(
                    "text-xs font-medium px-2.5 py-0.5 border capitalize",
                    row.original.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 
                    row.original.status === 'Rejected' ? 'bg-rose-500/10 text-rose-700 border-rose-500/20' : 
                    'bg-amber-500/10 text-amber-700 border-amber-500/20'
                )}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Applied On",
            cell: ({ row }) => (
                <span className="text-xs font-medium text-muted-foreground">
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
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">My Leave History</h1>
                <p className="text-xs text-muted-foreground mt-1 font-normal">View your leave requests and track approval statuses.</p>
            </div>
            <Button size="sm" asChild className="h-8 text-xs font-medium gap-1.5 rounded-lg shadow-xs">
                <Link href="/employee/leaves/new">
                    <CalendarPlus className="h-3.5 w-3.5" /> Apply for Leave
                </Link>
            </Button>
        </div>

        <DataTable 
            columns={columns} 
            data={leaves} 
            loading={loading}
            searchKey="leaveTypeId_name"
            searchPlaceholder="Search by leave type..."
        />
    </div>
    );
}
