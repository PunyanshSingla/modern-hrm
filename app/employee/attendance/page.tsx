"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
    _id: string;
    date: string;
    checkInTime: string;
    checkOutTime?: string;
    status: string;
    location?: {
        address?: string;
        latitude?: number;
        longitude?: number;
    };
    approvalStatus?: string;
    rejectionReason?: string;
}

export default function AttendanceHistoryPage() {
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const columns: ColumnDef<AttendanceRecord>[] = [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => (
                <span className="font-semibold text-xs text-foreground">
                    {format(new Date(row.original.date), "EEE, MMM d, yyyy")}
                </span>
            )
        },
        {
            accessorKey: "checkInTime",
            header: "Check In",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-700">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(row.original.checkInTime), "h:mm a")}
                </div>
            )
        },
        {
            accessorKey: "checkOutTime",
            header: "Check Out",
            cell: ({ row }) => row.original.checkOutTime ? (
                <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-700">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(row.original.checkOutTime), "h:mm a")}
                </div>
            ) : (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">Active</Badge>
            )
        },
        {
            id: "duration",
            header: "Duration",
            cell: ({ row }) => {
                const checkIn = new Date(row.original.checkInTime);
                const checkOut = row.original.checkOutTime ? new Date(row.original.checkOutTime) : null;
                if (!checkOut) return <span className="text-xs text-muted-foreground">-</span>;
                const diffMs = checkOut.getTime() - checkIn.getTime();
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                return <span className="text-xs font-semibold text-foreground">{hours}h {minutes}m</span>;
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="outline" className={cn(
                    "text-xs font-medium px-2.5 py-0.5 border capitalize",
                    row.original.status === 'Present' ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
                    row.original.status === 'Absent' ? "bg-rose-500/10 text-rose-700 border-rose-500/20" :
                    "bg-amber-500/10 text-amber-700 border-amber-500/20"
                )}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => {
                const loc = row.original.location;
                if (!loc || !loc.latitude) return <span className="text-xs text-muted-foreground">-</span>;
                
                const mapUrl = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
                
                return (
                    <a 
                        href={mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                        title="View on Google Maps"
                    >
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="tabular-nums">
                            {loc.latitude.toFixed(3)}, {loc.longitude?.toFixed(3)}
                        </span>
                    </a>
                );
            }
        },
        {
            accessorKey: "approvalStatus",
            header: "Approval",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <Badge variant="outline" className={cn(
                        "text-xs font-medium px-2.5 py-0.5 border capitalize",
                        row.original.approvalStatus === 'Approved' ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
                        row.original.approvalStatus === 'Rejected' ? "bg-rose-500/10 text-rose-700 border-rose-500/20" :
                        "bg-muted/60 text-muted-foreground border-border/60"
                    )}>
                        {row.original.approvalStatus || 'Pending'}
                    </Badge>
                    {row.original.approvalStatus === 'Rejected' && row.original.rejectionReason && (
                        <span className="text-[11px] font-normal text-rose-600 max-w-[140px] truncate" title={row.original.rejectionReason}>
                            "{row.original.rejectionReason}"
                        </span>
                    )}
                </div>
            )
        }
    ];

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/employee/attendance?history=true");
                const data = await res.json();
                if (data.success) {
                    setHistory(data.attendance || []);
                }
            } catch (error) {
                console.error("Error fetching attendance history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="border-b border-border/60 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Attendance History</h1>
            <p className="text-xs text-muted-foreground mt-1 font-normal">View your recent check-in and check-out records and location logs.</p>
        </div>

        <DataTable 
            columns={columns} 
            data={history} 
            loading={loading}
        />
    </div>
    );
}
