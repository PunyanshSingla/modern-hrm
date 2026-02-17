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
                <div className="flex flex-col gap-1 py-2">
                    <span className="font-bold uppercase tracking-tight text-foreground">{row.original.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">"{row.original.content}"</span>
                </div>
            )
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = row.original.priority;
                return (
                    <Badge variant="secondary" className={cn(
                        "font-black uppercase tracking-widest text-[9px] px-3",
                        priority === 'High' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' :
                        priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-sky-100 text-sky-700'
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
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <UserIcon className="h-3 w-3" />
                    {row.original.author}
                </div>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <span className="text-sm font-medium text-muted-foreground tabular-nums">
                    {format(new Date(row.original.createdAt), "MMM d, yyyy")}
                </span>
            )
        }
    ], []);

    const highPriorityCount = announcements.filter(a => a.priority === 'High').length;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                        <Megaphone className="h-3 w-3 mr-2" /> Official Channel
                    </Badge>
                    <h1 className="text-4xl font-black tracking-tight uppercase">Company Broadcasts</h1>
                    <p className="text-muted-foreground font-medium">
                        Stay informed with the latest updates and policy changes.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Total Updates"
                    value={announcements.length}
                    description="History of communications"
                    icon={Bell}
                />
                <StatsCard
                    title="Urgent Needs"
                    value={highPriorityCount}
                    description="Requiring your attention"
                    icon={ShieldAlert}
                    className="bg-rose-500/5 border-rose-500/10"
                />
                <StatsCard
                    title="Transparency"
                    value="100%"
                    description="Open communication policy"
                    icon={Megaphone}
                    className="bg-primary/5 border-primary/10"
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
