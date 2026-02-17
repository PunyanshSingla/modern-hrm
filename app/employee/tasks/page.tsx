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
            header: "Requirement",
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[300px]">
                    <span className="font-bold text-base">{row.original.title}</span>
                    {row.original.description && (
                        <p className="text-xs text-muted-foreground font-medium italic truncate">{row.original.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {row.original.projectId && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase font-black bg-primary/5 text-primary border-primary/20">
                                {row.original.projectId.name}
                            </Badge>
                        )}
                        {row.original.departmentId && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase font-black bg-amber-500/5 text-amber-600 border-amber-500/10">
                                <Building2 className="h-2 w-2 mr-1" /> {row.original.departmentId.name}
                            </Badge>
                        )}
                    </div>
                </div>
            )
        },
        {
            accessorKey: "assigneeIds",
            header: "Team",
            cell: ({ row }) => (
                <div className="flex -space-x-2">
                    {row.original.assigneeIds?.map((emp) => (
                        <Avatar key={emp._id} className="h-7 w-7 border-2 border-background ring-2 ring-primary/5 shadow-sm" title={`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Colleague'}>
                            <AvatarFallback className="text-[8px] font-black bg-primary text-primary-foreground">
                                {emp.firstName?.[0]?.toUpperCase() || ''}{emp.lastName?.[0]?.toUpperCase() || (!emp.firstName?.[0] ? '?' : '')}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                    {(!row.original.assigneeIds || row.original.assigneeIds.length === 0) && row.original.departmentId && (
                        <div className="h-7 w-7 rounded-full bg-amber-500/20 flex items-center justify-center border-2 border-background shadow-sm" title="Department Task">
                             <UsersIcon className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                    )}
                </div>
            )
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = row.original.priority;
                return (
                    <Badge variant="outline" className={cn(
                        "font-black uppercase text-[10px] tracking-widest px-2 py-0.5",
                        priority === 'Urgent' ? 'border-rose-500 text-rose-600 bg-rose-50' :
                        priority === 'High' ? 'border-orange-500 text-orange-600 bg-orange-50' :
                        priority === 'Medium' ? 'border-amber-500 text-amber-600 bg-amber-50' :
                        'border-slate-500 text-slate-600 bg-slate-50'
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
                    <Badge variant="secondary" className={cn(
                        "font-black uppercase text-[10px] tracking-widest px-3 py-1",
                        status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 border-none' :
                        status === 'Review' ? 'bg-blue-500/10 text-blue-600 border-none' :
                        status === 'In Progress' ? 'bg-amber-500/10 text-amber-600 border-none' :
                        'bg-slate-500/10 text-slate-600 border-none'
                    )}>
                        {status}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "dueDate",
            header: "Deadline",
            cell: ({ row }) => {
                const date = row.original.dueDate;
                if (!date) return <span className="text-muted-foreground text-xs italic">No quota</span>;
                const isOverdue = new Date(date) < new Date() && row.original.status !== 'Completed';
                return (
                    <div className={cn("flex items-center gap-1.5 font-bold", isOverdue ? "text-rose-600" : "text-foreground")}>
                        <CalendarDays className="h-4 w-4 opacity-50" />
                        {format(new Date(date), "MMM d, yyyy")}
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-2">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Update Progress</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus(row.original._id, "In Progress")} className="font-bold flex items-center justify-between">
                            In Progress <Clock className="h-3 w-3 text-amber-500" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(row.original._id, "Review")} className="font-bold flex items-center justify-between">
                            Submit for Review <AlertCircle className="h-3 w-3 text-blue-500" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(row.original._id, "Completed")} className="font-bold text-emerald-600 flex items-center justify-between">
                            Mark as Done <Check className="h-3 w-3" />
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
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                        <Star className="h-3 w-3 mr-2" /> Task Board
                    </Badge>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">My <span className="text-primary">Deliverables</span></h1>
                    <p className="text-muted-foreground font-medium italic">Track your assigned targets and update your work progress.</p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-muted rounded-2xl w-fit self-end">
                    <Button 
                        variant={viewMode === 'table' ? "default" : "ghost"} 
                        size="sm" 
                        className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9"
                        onClick={() => setViewMode('table')}
                    >
                        <TableIcon className="h-3.5 w-3.5 mr-2" /> Table
                    </Button>
                    <Button 
                        variant={viewMode === 'kanban' ? "default" : "ghost"} 
                        size="sm" 
                        className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-9"
                        onClick={() => setViewMode('kanban')}
                    >
                        <LayoutDashboard className="h-3.5 w-3.5 mr-2" /> Kanban
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard title="Open Tasks" value={pendingCount} icon={LayoutList} description="Currently on your desk" />
                <StatsCard title="Done & Dusted" value={completedCount} icon={CheckCircle} description="Successfully finished" />
                <StatsCard title="Attention Req" value={urgentCount} icon={AlertCircle} description="Urgent priority pending" />
            </div>

            <div className="space-y-4">
                {viewMode === 'table' ? (
                    <div className="">
                        <DataTable columns={columns} data={tasks} loading={loading} />
                    </div>
                ) : (
                    <div className="mt-4">
                        <KanbanBoard tasks={tasks} onTaskMove={updateStatus} />
                    </div>
                )}
            </div>
        </div>
    );
}
