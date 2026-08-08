"use client";

import { useState, useEffect, useMemo } from "react";
import { format, isAfter, startOfToday } from "date-fns";
import { 
    Calendar as CalendarIcon, 
    CalendarHeart,
    Star,
    Info
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Holiday {
    _id: string;
    name: string;
    date: string;
    type: 'Public' | 'Company' | 'Optional';
}

export default function EmployeeHolidaysPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/employee/holidays");
            const data = await res.json();
            if (data.success) {
                setHolidays(data.holidays);
            }
        } catch (error) {
            console.error("Failed to fetch holidays", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const columns = useMemo<ColumnDef<Holiday>[]>(() => [
        {
            accessorKey: "name",
            header: "Holiday Name",
            cell: ({ row }) => <div className="font-semibold text-xs text-foreground">{row.original.name}</div>
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-normal">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                    {format(new Date(row.original.date), "EEEE, MMM d, yyyy")}
                </div>
            )
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.original.type;
                return (
                    <Badge variant="outline" className={cn(
                        "text-xs font-medium px-2.5 py-0.5 border capitalize",
                        type === 'Public' ? 'bg-sky-500/10 text-sky-700 border-sky-500/20' :
                        type === 'Company' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-700 border-slate-500/20'
                    )}>
                        {type}
                    </Badge>
                );
            }
        }
    ], []);

    const upcomingHolidays = holidays.filter(h => isAfter(new Date(h.date), startOfToday())).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-border/60 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Company Holidays</h1>
                <p className="text-xs text-muted-foreground mt-1 font-normal">
                    Plan your time-off around scheduled company-wide holidays.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Holidays This Year"
                    value={holidays.length}
                    description="Total recorded observances"
                    icon={CalendarHeart}
                />
                <StatsCard
                    title="Upcoming"
                    value={upcomingHolidays}
                    description="Remaining holidays"
                    icon={Star}
                    className="bg-primary/5 border-primary/20"
                />
                <StatsCard
                    title="Holiday Policy"
                    value="Fixed"
                    description="Standard company allowance"
                    icon={Info}
                />
            </div>

            <div>
                <DataTable
                    columns={columns}
                    data={holidays}
                    loading={loading}
                    searchKey="name"
                />
            </div>
        </div>
    );
}
