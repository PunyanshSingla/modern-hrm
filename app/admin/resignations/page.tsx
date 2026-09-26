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
    ExternalLink,
    Filter
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { ColumnDef } from "@tanstack/react-table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
                        <span className="font-semibold text-sm text-foreground">{emp.firstName} {emp.lastName}</span>
                        <span className="text-xs text-muted-foreground font-normal">{emp.position || "Staff"}</span>
                    </div>
                ) : "Unknown";
            }
        },
        {
            accessorKey: "resignationDate",
            header: "Applied On",
            cell: ({ row }) => (
                <span className="text-xs font-medium text-foreground">{format(new Date(row.original.resignationDate), "MMM d, yyyy")}</span>
            )
        },
        {
            accessorKey: "lastWorkingDay",
            header: "Last Working Day",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">{format(new Date(row.original.lastWorkingDay), "MMM d, yyyy")}</span>
                    <span className="text-[11px] text-muted-foreground font-normal">{row.original.noticePeriod} Days Notice</span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge variant="outline" className={
                        status === 'Approved' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs font-medium px-2.5 py-0.5 capitalize' :
                        status === 'Rejected' ? 'bg-rose-500/10 text-rose-700 border-rose-500/20 text-xs font-medium px-2.5 py-0.5 capitalize' :
                        status === 'Withdrawn' ? 'bg-slate-500/10 text-slate-700 border-slate-500/20 text-xs font-medium px-2.5 py-0.5 capitalize' :
                        'bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs font-medium px-2.5 py-0.5 capitalize'
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
                const res = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/resignations/${res._id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-medium rounded-lg">
                                <ExternalLink className="h-3.5 w-3.5 mr-1" /> Review
                            </Button>
                        </Link>
                    </div>
                );
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
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Resignations & Offboarding</h1>
                    <p className="text-xs text-muted-foreground mt-1 font-normal">
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
                    loading={loading}
                />
                <StatsCard
                    title="Approved"
                    value={approvedCount}
                    description="In-progress offboarding"
                    icon={CheckCircle}
                    loading={loading}
                />
                <StatsCard
                    title="Total History"
                    value={totalCount}
                    description="Closed separation cases"
                    icon={LogOut}
                    loading={loading}
                />
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] h-8 text-xs border-border shadow-xs rounded-lg font-medium">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All" className="text-xs font-medium cursor-pointer">All Status</SelectItem>
                                <SelectItem value="Pending" className="text-xs font-medium cursor-pointer">Pending</SelectItem>
                                <SelectItem value="Approved" className="text-xs font-medium cursor-pointer">Approved</SelectItem>
                                <SelectItem value="Rejected" className="text-xs font-medium cursor-pointer">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
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
