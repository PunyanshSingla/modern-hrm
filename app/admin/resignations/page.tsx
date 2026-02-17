"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    LogOut, 
    Calendar, 
    Clock, 
    CheckCircle, 
    AlertCircle,
    Eye,
    Filter
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { ColumnDef } from "@tanstack/react-table";
import Link from 'next/link';
import { format } from "date-fns";
import SearchInput from "@/components/SearchInput";

interface Resignation {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        position: string;
        department?: string;
    };
    resignationDate: string;
    lastWorkingDay: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';
    noticePeriod: number;
    createdAt: string;
}

export default function AdminResignationsPage() {
    const [resignations, setResignations] = useState<Resignation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const fetchResignations = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/resignations");
            const data = await res.json();
            if (data.success) {
                setResignations(data.resignations);
            }
        } catch (error) {
            console.error("Failed to fetch resignations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResignations();
    }, []);

    const columns = useMemo<ColumnDef<Resignation>[]>(() => [
        {
            accessorKey: "employeeId",
            header: "Employee",
            cell: ({ row }) => {
                const emp = row.original.employeeId;
                return emp ? (
                    <div className="flex flex-col">
                        <span className="font-bold">{emp.firstName} {emp.lastName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{emp.position}</span>
                    </div>
                ) : "Unknown";
            }
        },
        {
            accessorKey: "resignationDate",
            header: "Applied On",
            cell: ({ row }) => (
                <span className="text-sm font-medium">{format(new Date(row.original.resignationDate), "MMM d, yyyy")}</span>
            )
        },
        {
            accessorKey: "lastWorkingDay",
            header: "Last Working Day",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-primary">{format(new Date(row.original.lastWorkingDay), "MMM d, yyyy")}</span>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{row.original.noticePeriod} Days Notice</span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge variant="secondary" className={
                        status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 font-black uppercase text-[10px] tracking-widest' :
                        status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 border-none px-3 py-1 font-black uppercase text-[10px] tracking-widest' :
                        status === 'Withdrawn' ? 'bg-slate-500/10 text-slate-600 border-none px-3 py-1 font-black uppercase text-[10px] tracking-widest' :
                        'bg-amber-500/10 text-amber-600 border-none px-3 py-1 font-black uppercase text-[10px] tracking-widest'
                    }>
                        {status}
                    </Badge>
                )
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const res = row.original;
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <Link href={`/admin/resignations/${res._id}`}>
                            <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all hover:bg-primary hover:text-white">
                                <Eye className="h-4 w-4 mr-2" /> Review
                            </Button>
                        </Link>
                    </div>
                )
            }
        }
    ], []);

    const filteredResignations = useMemo(() => {
        return resignations.filter(res => {
            const matchesSearch =
                res.employeeId?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                res.employeeId?.lastName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "All" || res.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [resignations, searchTerm, statusFilter]);

    // Stats
    const pendingCount = resignations.filter(r => r.status === 'Pending').length;
    const approvedCount = resignations.filter(r => r.status === 'Approved').length;
    const totalCount = resignations.length;

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                        <LogOut className="h-3 w-3 mr-2" /> Separation Management
                    </Badge>
                    <h1 className="text-4xl font-black tracking-tight uppercase">Resignation Requests</h1>
                    <p className="text-muted-foreground font-medium">
                        Manage employee departures and offboarding workflows.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Awaiting Review"
                    value={pendingCount}
                    description="New resignation requests"
                    icon={Clock}
                />
                <StatsCard
                    title="Approved"
                    value={approvedCount}
                    description="In-progress offboarding"
                    icon={CheckCircle}
                />
                <StatsCard
                    title="Total History"
                    value={totalCount}
                    description="Closed separation cases"
                    icon={LogOut}
                />
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select 
                            className="bg-background border-2 rounded-xl h-10 px-4 font-bold text-xs uppercase tracking-widest focus:ring-primary outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="">
                    <DataTable
                        columns={columns}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        data={filteredResignations}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
