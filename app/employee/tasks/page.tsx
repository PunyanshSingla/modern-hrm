"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { 
    CalendarDays, 
    Star,
    Check,
    LayoutDashboard,
    Table as TableIcon,
    Users as UsersIcon,
    Building2,
    LayoutList,
    Clock,
    CheckCircle,
    AlertCircle,
    MoreHorizontal
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import KanbanBoard from "@/components/KanbanBoard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Task {
    _id: string;
    title: string;
    description?: string;
    assigneeIds?: {
        _id: string;
        firstName: string;
        lastName: string;
    }[];
    departmentId?: {
        _id: string;
        name: string;
    };
    projectId?: {
        _id: string;
        name: string;
    };
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
    dueDate?: string;
    createdAt: string;
}

export default function EmployeeTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/employee/tasks");
            const data = await res.json();
            if (data.success) {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/employee/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Task marked as ${status}`);
                fetchTasks();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const columns = useMemo<ColumnDef<Task>[]>(() => [
        {
            accessorKey: "title",
            header: "Task",
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[300px]">
                    <span className="font-semibold text-sm text-foreground">{row.original.title}</span>
                    {row.original.description && (
                        <p className="text-xs text-muted-foreground font-medium italic truncate mt-0.5">{row.original.description}</p>
                    )}
                    {row.original.projectId && (
                        <span className="text-xs text-muted-foreground font-normal mt-0.5">
                            Project: {row.original.projectId.name}
                        </span>
                    )}
                </div>
            )
        },
        {
            accessorKey: "assigneeIds",
            header: "Assignees",
            cell: ({ row }) => {
                const assignees = row.original.assigneeIds;
                const dept = row.original.departmentId;
                return (
                    <div className="flex flex-col gap-1 items-start">
                        <div className="flex -space-x-1.5 overflow-hidden">
                            {assignees?.map((emp) => (
                                <Avatar key={emp._id} className="h-6 w-6 border border-background" title={`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown'}>
                                    <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
                                        {emp.firstName?.[0]?.toUpperCase() || ''}{emp.lastName?.[0]?.toUpperCase() || (!emp.firstName?.[0] ? '?' : '')}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        {dept && (
                            <Badge variant="secondary" className="text-[11px] font-medium bg-muted/60 text-foreground border-border/50 px-1.5 py-0">
                                {dept.name}
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = row.original.priority;
                return (
                    <Badge variant="outline" className={cn(
                        "text-xs font-medium px-2 py-0.5 border capitalize",
                        priority === 'Urgent' ? 'bg-rose-500/10 text-rose-700 border-rose-500/20' :
                        priority === 'High' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                        priority === 'Medium' ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' :
                        'bg-slate-500/10 text-slate-700 border-slate-500/20'
                    )}>
                        {priority}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge variant="outline" className={cn(
                        "text-xs font-medium px-2.5 py-0.5 border capitalize",
                        status === 'Completed' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                        status === 'Review' ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' :
                        status === 'In Progress' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-700 border-slate-500/20'
                    )}>
                        {status}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }) => {
                const date = row.original.dueDate;
                if (!date) return <span className="text-muted-foreground text-xs italic">No limit</span>;
                const isOverdue = new Date(date) < new Date() && row.original.status !== 'Completed';
                return (
                    <span className={cn("text-xs font-medium", isOverdue ? "text-rose-600" : "text-foreground")}>
                        {format(new Date(date), "MMM d, yyyy")}
                    </span>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">Update Progress</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus(row.original._id, "In Progress")} className="text-xs font-medium flex items-center justify-between">
                            In Progress <Clock className="h-3.5 w-3.5 text-amber-500" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(row.original._id, "Review")} className="text-xs font-medium flex items-center justify-between">
                            Submit for Review <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(row.original._id, "Completed")} className="text-xs font-medium text-emerald-600 flex items-center justify-between">
                            Mark as Done <Check className="h-3.5 w-3.5 text-emerald-600" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ], []);

    // Stats
    const pendingCount = tasks.filter(t => t.status !== 'Completed').length;
    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const urgentCount = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">My Deliverables & Tasks</h1>
                    <p className="text-xs text-muted-foreground mt-1 font-normal">Track assigned deliverables, manage deadlines, and update progress.</p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
                    <Button 
                        variant={viewMode === 'table' ? "default" : "ghost"} 
                        size="sm" 
                        className="h-7 text-xs font-medium rounded-md px-2.5 gap-1.5"
                        onClick={() => setViewMode('table')}
                    >
                        <TableIcon className="h-3.5 w-3.5" /> Table
                    </Button>
                    <Button 
                        variant={viewMode === 'kanban' ? "default" : "ghost"} 
                        size="sm" 
                        className="h-7 text-xs font-medium rounded-md px-2.5 gap-1.5"
                        onClick={() => setViewMode('kanban')}
                    >
                        <LayoutDashboard className="h-3.5 w-3.5" /> Kanban
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard title="Open Tasks" value={pendingCount} icon={LayoutList} description="Currently assigned to you" loading={loading} />
                <StatsCard title="Completed" value={completedCount} icon={CheckCircle} description="Successfully finished" loading={loading} />
                <StatsCard title="Attention Required" value={urgentCount} icon={AlertCircle} description="Urgent priority pending" loading={loading} />
            </div>

            <div className="space-y-4">
                {viewMode === 'table' ? (
                    <div>
                        <DataTable columns={columns} data={tasks} loading={loading} />
                    </div>
                ) : loading ? (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, colIdx) => (
                            <div key={colIdx} className="bg-card rounded-xl p-4 border border-border/60 space-y-3">
                                <Skeleton className="h-6 w-28 rounded-md opacity-70 mb-4" />
                                <Skeleton className="h-24 w-full rounded-xl opacity-60" />
                                <Skeleton className="h-24 w-full rounded-xl opacity-40" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-2">
                        <KanbanBoard tasks={tasks} onTaskMove={updateStatus} />
                    </div>
                )}
            </div>
        </div>
    );
}
