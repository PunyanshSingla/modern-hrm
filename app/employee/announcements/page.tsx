"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { 
    Megaphone, 
    Bell,
    ShieldAlert,
    User as UserIcon,
    ArrowRight
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Announcement {
    _id: string;
    title: string;
    content: string;
    priority: 'Low' | 'Medium' | 'High';
    author: string;
    createdAt: string;
}

export default function EmployeeAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/employee/announcements");
            const data = await res.json();
            if (data.success) {
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const columns = useMemo<ColumnDef<Announcement>[]>(() => [
        {
            accessorKey: "title",
            header: "Announcement",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5 py-1">
                    <span className="font-semibold text-xs text-foreground">{row.original.title}</span>
                    <span className="text-[11px] text-muted-foreground line-clamp-2 font-normal leading-relaxed">"{row.original.content}"</span>
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
                        "text-xs font-medium px-2.5 py-0.5 border capitalize",
                        priority === 'High' ? 'bg-rose-500/10 text-rose-700 border-rose-500/20' :
                        priority === 'Medium' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                        'bg-sky-500/10 text-sky-700 border-sky-500/20'
                    )}>
                        {priority}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "author",
            header: "By",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                    <UserIcon className="h-3.5 w-3.5 text-primary" />
                    {row.original.author}
                </div>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                    {format(new Date(row.original.createdAt), "MMM d, yyyy")}
                </span>
            )
        }
    ], []);

    const highPriorityCount = announcements.filter(a => a.priority === 'High').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-border/60 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Company News & Announcements</h1>
                <p className="text-xs text-muted-foreground mt-1 font-normal">
                    Stay informed with company broadcasts and administrative updates.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Total News Items"
                    value={announcements.length}
                    description="Published broadcasts"
                    icon={Bell}
                />
                <StatsCard
                    title="Urgent News"
                    value={highPriorityCount}
                    description="High priority broadcasts"
                    icon={ShieldAlert}
                    className="bg-rose-500/5 border-rose-500/20"
                />
                <StatsCard
                    title="Channel Status"
                    value="Active"
                    description="Internal communications"
                    icon={Megaphone}
                    className="bg-primary/5 border-primary/20"
                />
            </div>

            <DataTable
                columns={columns}
                data={announcements}
                loading={loading}
                searchKey="title"
            />
        </div>
    );
}
