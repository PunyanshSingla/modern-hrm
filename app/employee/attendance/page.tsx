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
                <span className="font-bold italic">
                    {format(new Date(row.original.date), "EEE, MMM d, yyyy")}
                </span>
            )
        },
        {
            accessorKey: "checkInTime",
            header: "Check In",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 font-bold text-emerald-600">
                    <Clock className="h-4 w-4" />
                    {format(new Date(row.original.checkInTime), "h:mm a")}
                </div>
            )
        },
        {
            accessorKey: "checkOutTime",
            header: "Check Out",
            cell: ({ row }) => row.original.checkOutTime ? (
                <div className="flex items-center gap-2 font-bold text-amber-600">
                    <Clock className="h-4 w-4" />
                    {format(new Date(row.original.checkOutTime), "h:mm a")}
                </div>
            ) : (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[10px]">Active</Badge>
            )
        },
        {
            id: "duration",
            header: "Duration",
            cell: ({ row }) => {
                const checkIn = new Date(row.original.checkInTime);
                const checkOut = row.original.checkOutTime ? new Date(row.original.checkOutTime) : null;
                if (!checkOut) return "-";
                const diffMs = checkOut.getTime() - checkIn.getTime();
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                return <span className="font-black tracking-tight">{hours}h {minutes}m</span>;
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="outline" className={cn(
                    "font-bold px-3 py-0.5 rounded-full border-none",
                    row.original.status === 'Present' ? "text-emerald-500 bg-emerald-500/10" :
                    row.original.status === 'Absent' ? "text-rose-500 bg-rose-500/10" :
                    "text-amber-500 bg-amber-500/10"
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
                        className="group flex items-center gap-2 p-1.5 px-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all w-fit"
                        title="View on Google Maps"
                    >
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-primary/70 leading-none mb-0.5">Live Location</span>
                            <span className="text-[10px] font-mono tabular-nums text-slate-500 leading-none">
                                {loc.latitude.toFixed(4)}, {loc.longitude?.toFixed(4)}
                            </span>
                        </div>
                        <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <MapPin className="h-3.5 w-3.5" />
                        </div>
                    </a>
                );
            }
        },
        {
            accessorKey: "approvalStatus",
            header: "Approval",
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className={cn(
                        "font-black uppercase tracking-widest text-[10px] px-3 py-1",
                        row.original.approvalStatus === 'Approved' ? "bg-emerald-500/10 text-emerald-600 border-none" :
                        row.original.approvalStatus === 'Rejected' ? "bg-rose-500/10 text-rose-600 border-none" :
                        "bg-muted text-muted-foreground border-none"
                    )}>
                        {row.original.approvalStatus || 'Pending'}
                    </Badge>
                    {row.original.approvalStatus === 'Rejected' && row.original.rejectionReason && (
                        <span className="text-[10px] font-medium text-rose-600 max-w-[120px] truncate italic" title={row.original.rejectionReason}>
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
    <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
                <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                    <Clock className="h-3 w-3 mr-2" /> Attendance Tracker
                </Badge>
                <h1 className="text-4xl font-black tracking-tight uppercase">My Attendance</h1>
                <p className="text-muted-foreground font-medium">View your recent check-in and check-out history.</p>
            </div>
        </div>

        <DataTable 
            columns={columns} 
            data={history} 
            loading={loading}
        />
    </div>
    );
}
