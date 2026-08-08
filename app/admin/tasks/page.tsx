"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    LayoutList, 
    Calendar, 
    Clock, 
    CheckCircle, 
    AlertCircle,
    Plus,
    Filter,
    MoreHorizontal,
    Trash2,
    CalendarDays,
    Star,
    LayoutDashboard,
    Table as TableIcon,
    Users as UsersIcon,
    Building2
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import KanbanBoard from "@/components/KanbanBoard";
import { MultiSelect } from "@/components/ui/multi-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import SearchInput from "@/components/SearchInput";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Task {
    _id: string;
    title: string;
    description?: string;
    assigneeIds: {
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

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assigneeIds: [] as string[],
        departmentId: "",
        projectId: "",
        priority: "Medium",
        status: "To Do",
        dueDate: ""
    });

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/tasks");
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

    const fetchAuxData = async () => {
        try {
            const [empRes, projRes, deptRes] = await Promise.all([
                fetch("/api/admin/employees"),
                fetch("/api/admin/projects"),
                fetch("/api/admin/departments")
            ]);
            const [empData, projData, deptData] = await Promise.all([
                empRes.json(),
                projRes.json(),
                deptRes.json()
            ]);
            if (empData.success) setEmployees(empData.employees.map((e: any) => ({
                label: `${e.firstName} ${e.lastName}`,
                value: e._id
            })));
            if (projData.success) setProjects(projData.projects);
            if (deptData.success) setDepartments(deptData.departments);
        } catch (error) {
            console.error("Failed to fetch auxiliary data", error);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchAuxData();
    }, []);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Task created successfully");
                setIsCreateOpen(false);
                setFormData({
                    title: "",
                    description: "",
                    assigneeIds: [],
                    departmentId: "",
                    projectId: "",
                    priority: "Medium",
                    status: "To Do",
                    dueDate: ""
                });
                fetchTasks();
            } else {
                toast.error(data.error || "Failed to create task");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleTaskMove = async (taskId: string, newStatus: string) => {
        // Restricted for Admin per requirement
        toast.info("Administrators cannot change status via drag-and-drop. Use the edit feature (coming soon) or wait for employee updates.");
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Task deleted");
                fetchTasks();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const columns = useMemo<ColumnDef<Task>[]>(() => [
        {
            accessorKey: "title",
            header: "Task",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold">{row.original.title}</span>
                    {row.original.projectId && (
                        <span className="text-[10px] text-primary uppercase font-black tracking-tighter">
                            Proj: {row.original.projectId.name}
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
                    <div className="flex flex-col gap-1">
                        <div className="flex -space-x-1.5">
                            {assignees?.map((emp) => (
                                <Avatar key={emp._id} className="h-6 w-6 border-2 border-background" title={`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown'}>
                                    <AvatarFallback className="text-[8px] font-black bg-primary text-primary-foreground">
                                        {emp.firstName?.[0]?.toUpperCase() || ''}{emp.lastName?.[0]?.toUpperCase() || (!emp.firstName?.[0] ? '?' : '')}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        {dept && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0 bg-amber-500/5 text-amber-600 border-amber-500/10 font-black uppercase w-fit">
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
            header: "Due Date",
            cell: ({ row }) => (
                <span className="text-sm font-medium">
                    {row.original.dueDate ? format(new Date(row.original.dueDate), "MMM d, yyyy") : "No limit"}
                </span>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(row.original._id)}>
                        <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                </div>
            )
        }
    ], []);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || task.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tasks, searchTerm, statusFilter]);

    // Stats
    const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const todoCount = tasks.filter(t => t.status === 'To Do').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                        <LayoutList className="h-3 w-3 mr-2" /> Operations
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
                    <p className="text-muted-foreground font-medium">Assign work, track progress, and manage company operations.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Create Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold">Create New Task</DialogTitle>
                            <DialogDescription className="text-xs">Fill in details to assign a new task.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask} className="space-y-4 py-2">
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="title" className="text-xs font-semibold">Task Title</Label>
                                    <Input id="title" placeholder="What needs to be done?" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Assign Employees</Label>
                                    <MultiSelect
                                        options={employees}
                                        onValueChange={(vals) => setFormData({...formData, assigneeIds: vals})}
                                        defaultValue={formData.assigneeIds}
                                        placeholder="Search and select employees..."
                                        maxCount={5}
                                        className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Department Assignment</Label>
                                        <Select onValueChange={(v) => setFormData({...formData, departmentId: v})}>
                                            <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map(dept => (
                                                    <SelectItem key={dept._id} value={dept._id} className="text-xs font-medium cursor-pointer">{dept.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Priority</Label>
                                        <Select defaultValue="Medium" onValueChange={(v) => setFormData({...formData, priority: v})}>
                                            <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                                                <SelectValue placeholder="Priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low" className="text-xs font-medium cursor-pointer">Low</SelectItem>
                                                <SelectItem value="Medium" className="text-xs font-medium cursor-pointer">Medium</SelectItem>
                                                <SelectItem value="High" className="text-xs font-medium cursor-pointer">High</SelectItem>
                                                <SelectItem value="Urgent" className="text-xs font-medium cursor-pointer">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Project (Optional)</Label>
                                        <Select onValueChange={(v) => setFormData({...formData, projectId: v})}>
                                            <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                                                <SelectValue placeholder="Select Project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projects.map(p => (
                                                    <SelectItem key={p._id} value={p._id} className="text-xs font-medium cursor-pointer">{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dueDate" className="text-xs font-semibold">Due Date</Label>
                                        <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
                                    <Textarea id="description" placeholder="Provide more details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="text-xs border-muted-foreground/60 focus:border-primary shadow-none h-24 resize-none rounded-lg" />
                                </div>
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="submit" className="w-full h-9 text-xs">
                                    Create Task
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard title="To Do" value={todoCount} icon={Star} description="Tasks not yet started" />
                <StatsCard title="In Progress" value={inProgressCount} icon={Clock} description="Currently being worked on" />
                <StatsCard title="Completed" value={completedCount} icon={CheckCircle} description="Successfully delivered" />
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 p-1 bg-muted rounded-2xl w-fit">
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
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select 
                            className="bg-background border-2 rounded-xl h-10 px-4 font-bold text-xs uppercase tracking-widest focus:ring-primary outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <DataTable columns={columns} data={filteredTasks} loading={loading} searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                ) : (
                    <div className="mt-4">
                        <KanbanBoard tasks={filteredTasks} onTaskMove={handleTaskMove} isReadOnly={true} />
                    </div>
                )}
            </div>
        </div>
    );
}
