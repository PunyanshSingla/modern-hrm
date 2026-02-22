"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { 
    FolderKanban, 
    Activity,
    Clock,
    CheckCircle2,
    LayoutDashboard
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Project {
    _id: string;
    name: string;
    description: string;
    status: 'Active' | 'Completed' | 'On Hold' | 'Planned';
    startDate: string;
    endDate: string;
    departmentId?: { name: string };
}

export default function EmployeeProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/employee/projects?t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const columns = useMemo<ColumnDef<Project>[]>(() => [
        {
            accessorKey: "name",
            header: "Project",
            cell: ({ row }) => (
                <div className="flex flex-col gap-1 py-1">
                    <span className="font-bold uppercase tracking-tight text-foreground">{row.original.name}</span>
                    <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">{row.original.description || "No description provided."}</span>
                </div>
            )
        },
        {
            accessorKey: "departmentId.name",
            header: "Department",
            cell: ({ row }) => row.original.departmentId?.name ? (
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-primary/20 bg-primary/5 text-primary">
                    {row.original.departmentId.name}
                </Badge>
            ) : "-"
        },
        {
            accessorKey: "dates",
            header: "Timeline",
            cell: ({ row }) => (
                <div className="flex flex-col text-xs font-medium tabular-nums">
                    <span className="text-foreground/80">{format(new Date(row.original.startDate), "MMM d, yyyy")}</span>
                    <span className="text-muted-foreground opacity-60">to {format(new Date(row.original.endDate), "MMM d, yyyy")}</span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge variant="secondary" className={cn(
                        "font-black uppercase tracking-widest text-[9px] px-3 py-0.5 border-none",
                        status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
                        status === 'Completed' ? 'bg-sky-500/10 text-sky-600' :
                        status === 'On Hold' ? 'bg-rose-500/10 text-rose-600' :
                        'bg-amber-500/10 text-amber-600'
                    )}>
                        {status}
                    </Badge>
                );
            }
        }
    ], []);

    const activeCount = projects.filter(p => p.status === 'Active').length;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                        <FolderKanban className="h-3 w-3 mr-2" /> Project Central
                    </Badge>
                    <h1 className="text-4xl font-black tracking-tight uppercase">My Assignments</h1>
                    <p className="text-muted-foreground font-medium">
                        Track projects you are currently assigned to and their progress.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Active Work"
                    value={activeCount}
                    description="Ongoing projects"
                    icon={Activity}
                    className="bg-primary/5 border-primary/10 transition-all hover:scale-105"
                />
                <StatsCard
                    title="Deadline Map"
                    value={projects.length}
                    description="Total managed tasks"
                    icon={Clock}
                />
                <StatsCard
                    title="Completed"
                    value={projects.filter(p => p.status === 'Completed').length}
                    description="Sucessfully delivered"
                    icon={CheckCircle2}
                />
            </div>

            <DataTable
                columns={columns}
                data={projects}
                loading={loading}
                searchKey="name"
            />
        </div>
    );
}
