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
                <span className="font-bold">{format(new Date(row.original.resignationDate), "MMM d, yyyy")}</span>
            )
        },
        {
            accessorKey: "lastWorkingDay",
            header: "Last Working Day",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-primary">{format(new Date(row.original.lastWorkingDay), "MMM d, yyyy")}</span>
                    <span className="text-muted-foreground text-xs font-medium">{row.original.noticePeriod} Days Notice</span>
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
                    row.original.status === 'Withdrawn' ? 'bg-slate-500/10 text-slate-600 border-none' :
                    'bg-amber-500/10 text-amber-600 border-none'
                )}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            accessorKey: "reason",
            header: "Reason",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate text-sm font-medium text-muted-foreground italic" title={row.original.reason}>
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
    <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
                <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                    <LogOut className="h-3 w-3 mr-2" /> Separation
                </Badge>
                <h1 className="text-4xl font-black tracking-tight uppercase">Resignations</h1>
                <p className="text-muted-foreground font-medium">Manage your resignation and offboarding process.</p>
            </div>
            {!activeResignation && (
                <Button asChild className="h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 font-bold transition-all hover:scale-105 active:scale-95 bg-rose-600 hover:bg-rose-700">
                    <Link href="/employee/resignations/new">
                        <LogOut className="mr-2 h-5 w-5" /> Submit Resignation
                    </Link>
                </Button>
            )}
        </div>

        {activeResignation && (
            <Card className="rounded-[40px] border-amber-500/20 bg-amber-500/5 backdrop-blur-sm shadow-xl overflow-hidden border-l-8 border-l-amber-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-tight text-amber-700">
                        <Clock className="h-6 w-6" /> Active Process: {activeResignation.status}
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">Last Working Day</p>
                        <p className="text-2xl font-black text-primary">{format(new Date(activeResignation.lastWorkingDay), "MMMM d, yyyy")}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">Notice Period</p>
                        <p className="text-2xl font-black text-primary">{activeResignation.noticePeriod} Days</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">Status</p>
                        <Badge variant="secondary" className="mt-1 font-black uppercase bg-amber-500/10 text-amber-600 border-none">
                            {activeResignation.status}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        )}

        <div className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Request History
            </h2>
            <DataTable 
                columns={columns} 
                data={resignations} 
                loading={loading}
                searchKey="reason"
            />
        </div>

        {!activeResignation && resignations.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 rounded-[40px] border-2 border-dashed border-muted-foreground/20 bg-muted/5">
                <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-bold uppercase text-muted-foreground/60">No Resignation History</h3>
                <p className="text-sm text-muted-foreground font-medium italic">Your separation history will appear here.</p>
            </div>
        )}
    </div>
    );
}
