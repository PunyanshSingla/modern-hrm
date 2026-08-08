"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Calendar, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResignationRequest {
    _id: string;
    resignationDate: string;
    lastWorkingDay: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';
    noticePeriod: number;
    adminRemarks?: string;
    createdAt: string;
}

export default function EmployeeResignationsPage() {
    const [resignations, setResignations] = useState<ResignationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const columns: ColumnDef<ResignationRequest>[] = [
        {
            accessorKey: "resignationDate",
            header: "Applied On",
            cell: ({ row }) => (
                <span className="font-semibold text-xs text-foreground">{format(new Date(row.original.resignationDate), "MMM d, yyyy")}</span>
            )
        },
        {
            accessorKey: "lastWorkingDay",
            header: "Last Working Day",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-xs text-primary">{format(new Date(row.original.lastWorkingDay), "MMM d, yyyy")}</span>
                    <span className="text-muted-foreground text-[11px] font-normal">{row.original.noticePeriod} Days Notice</span>
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
                    row.original.status === 'Withdrawn' ? 'bg-slate-500/10 text-slate-700 border-slate-500/20' :
                    'bg-amber-500/10 text-amber-700 border-amber-500/20'
                )}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            accessorKey: "reason",
            header: "Reason",
            cell: ({ row }) => (
                <div className="max-w-[220px] truncate text-xs font-normal text-muted-foreground" title={row.original.reason}>
                    "{row.original.reason}"
                </div>
            )
        }
    ];

    useEffect(() => {
        fetchResignations();
    }, []);

    const fetchResignations = async () => {
        try {
            const res = await fetch("/api/employee/resignations");
            const data = await res.json();
            if (data.success) {
                setResignations(data.resignations || []);
            }
        } catch (error) {
            console.error("Error fetching resignations:", error);
        } finally {
            setLoading(false);
        }
    };

    const activeResignation = resignations.find(r => r.status === 'Pending' || r.status === 'Approved');

    return (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Resignation Requests</h1>
                <p className="text-xs text-muted-foreground mt-1 font-normal">Manage your resignation application and offboarding timeline.</p>
            </div>
            {!activeResignation && (
                <Button size="sm" asChild className="h-8 text-xs font-medium gap-1.5 rounded-lg shadow-xs bg-rose-600 hover:bg-rose-700 text-white">
                    <Link href="/employee/resignations/new">
                        <LogOut className="h-3.5 w-3.5" /> Submit Resignation
                    </Link>
                </Button>
            )}
        </div>

        {activeResignation && (
            <Card className="rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                        <Clock className="h-4 w-4 text-amber-600" /> Active Separation Process ({activeResignation.status})
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Proposed Last Working Day</p>
                        <p className="text-sm font-semibold text-foreground">{format(new Date(activeResignation.lastWorkingDay), "MMMM d, yyyy")}</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Notice Period</p>
                        <p className="text-sm font-semibold text-foreground">{activeResignation.noticePeriod} Days</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Status</p>
                        <Badge variant="outline" className="mt-0.5 text-xs font-medium bg-amber-500/10 text-amber-700 border-amber-500/20">
                            {activeResignation.status}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        )}

        <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Request History
            </h2>
            <DataTable 
                columns={columns} 
                data={resignations} 
                loading={loading}
                searchKey="reason"
            />
        </div>

        {!activeResignation && resignations.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border/60 bg-muted/20">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <h3 className="text-xs font-semibold text-foreground">No Resignation History</h3>
                <p className="text-xs text-muted-foreground font-normal">Your separation applications will be displayed here.</p>
            </div>
        )}
    </div>
    );
}
