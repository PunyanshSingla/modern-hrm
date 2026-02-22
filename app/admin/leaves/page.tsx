"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Trash2,
    View,
    Filter,
    CalendarIcon,
    CheckCircle,
    Clock,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import Link from 'next/link';
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LeaveTypeManager } from "@/components/leave-type-manager";
import { LeaveBalanceManager } from "@/components/leave-balance-manager";
import SearchInput from "@/components/SearchInput";

interface Leave {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    leaveTypeId: {
        name: string;
        color: string;
    };
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    createdAt: string;
}

export default function LeavesPage() {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/leaves");
            const data = await res.json();
            if (data.success) {
                setLeaves(data.leaves);
            }
        } catch (error) {
            console.error("Failed to fetch leaves", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this leave request?")) return;
        try {
            const res = await fetch(`/api/admin/leaves/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchLeaves();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error deleting leave", error);
        }
    };

    const columns = useMemo<ColumnDef<Leave>[]>(() => [
        {
            accessorKey: "employeeId",
            header: "Employee",
            cell: ({ row }) => {
                const emp = row.original.employeeId;
                return emp ? <div className="font-medium">{emp.firstName} {emp.lastName}</div> : "Unknown";
            }
        },
        {
            accessorKey: "leaveTypeId",
            header: "Type",
            cell: ({ row }) => {
                const type = row.original.leaveTypeId;
                return type ? (
                    <div className="flex items-center justify-center text-center">
                        <span className="capitalize font-medium">{type.name}</span>
                    </div>
                ) : <span className="text-muted-foreground text-sm">Unknown</span>;
            }
        },
        {
            accessorKey: "dates",
            header: "Duration",
            cell: ({ row }) => {
                const start = format(new Date(row.original.startDate), "MMM d, yyyy");
                const end = format(new Date(row.original.endDate), "MMM d, yyyy");
                return <div className="text-sm text-muted-foreground text-center">{start} - {end}</div>
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
                if (status === 'Approved') variant = "default";
                if (status === 'Rejected') variant = "destructive";

                return (
                    <Badge variant={variant} className={
                        status === 'Approved' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-100' :
                            status === 'Rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-100' :
                                'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100'
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
                const leave = row.original;
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <Link href={`/admin/leaves/${leave._id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <View className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(leave._id)}>
                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                        </Button>
                    </div>
                )
            }
        }
    ], []);

    const filteredLeaves = useMemo(() => {
        return leaves.filter(leave => {
            const matchesSearch =
                leave.employeeId?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                leave.employeeId?.lastName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "All" || leave.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [leaves, searchTerm, statusFilter]);

    // Stats logic
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const totalLeaves = leaves.length;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Leave Requests</h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Balance team capacity and manage time-off requests.
                    </p>
                </div>
                <div className="flex gap-2">
                    <LeaveTypeManager onUpdate={fetchLeaves} />
                    <LeaveBalanceManager />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Pending Requests"
                    value={pendingLeaves}
                    description="Awaiting your review"
                    icon={Clock}
                />
                <StatsCard
                    title="Approved"
                    value={approvedLeaves}
                    description="Successfully granted"
                    icon={CheckCircle}
                />
                <StatsCard
                    title="Total History"
                    value={totalLeaves}
                    description="Cumulate records"
                    icon={CalendarIcon}
                />
            </div>

            <div className="overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredLeaves}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    loading={loading}
                />
            </div>
        </div>
    );
}
