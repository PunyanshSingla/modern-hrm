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
                <div className="flex flex-col gap-0.5 py-1">
                    <span className="font-semibold text-xs text-foreground">{row.original.name}</span>
                    <span className="text-[11px] text-muted-foreground truncate max-w-[240px] font-normal">{row.original.description || "No description provided."}</span>
                </div>
            )
        },
        {
            accessorKey: "departmentId.name",
            header: "Department",
            cell: ({ row }) => row.original.departmentId?.name ? (
                <Badge variant="outline" className="text-[11px] font-medium bg-muted/60 text-foreground border-border/50">
                    {row.original.departmentId.name}
                </Badge>
            ) : "-"
        },
        {
            accessorKey: "dates",
            header: "Timeline",
            cell: ({ row }) => (
                <div className="flex flex-col text-xs font-normal tabular-nums">
                    <span className="text-foreground">{format(new Date(row.original.startDate), "MMM d, yyyy")}</span>
                    <span className="text-muted-foreground">to {format(new Date(row.original.endDate), "MMM d, yyyy")}</span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge variant="outline" className={cn(
                        "text-xs font-medium px-2.5 py-0.5 border capitalize",
                        status === 'Active' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                        status === 'Completed' ? 'bg-sky-500/10 text-sky-700 border-sky-500/20' :
                        status === 'On Hold' ? 'bg-rose-500/10 text-rose-700 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-700 border-amber-500/20'
                    )}>
                        {status}
                    </Badge>
                );
            }
        }
    ], []);

    const activeCount = projects.filter(p => p.status === 'Active').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-border/60 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">My Assigned Projects</h1>
                <p className="text-xs text-muted-foreground mt-1 font-normal">
                    Track your active project allocations and delivery deadlines.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Active Work"
                    value={activeCount}
                    description="Ongoing projects"
                    icon={Activity}
                    className="bg-primary/5 border-primary/20"
                    loading={loading}
                />
                <StatsCard
                    title="Total Projects"
                    value={projects.length}
                    description="Assigned allocations"
                    icon={Clock}
                    loading={loading}
                />
                <StatsCard
                    title="Completed"
                    value={projects.filter(p => p.status === 'Completed').length}
                    description="Delivered milestones"
                    icon={CheckCircle2}
                    loading={loading}
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
