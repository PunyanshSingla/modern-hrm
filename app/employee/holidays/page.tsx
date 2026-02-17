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
            cell: ({ row }) => <div className="font-bold uppercase tracking-tight">{row.original.name}</div>
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 font-medium italic">
                    <CalendarIcon className="h-4 w-4 text-primary/50" />
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
                    <Badge variant="secondary" className={
                        type === 'Public' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-100' :
                        type === 'Company' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100'
                    }>
                        {type}
                    </Badge>
                );
            }
        }
    ], []);

    const upcomingHolidays = holidays.filter(h => isAfter(new Date(h.date), startOfToday())).length;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                        <CalendarHeart className="h-3 w-3 mr-2" /> Holiday Calendar
                    </Badge>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">Company Holidays</h1>
                    <p className="text-muted-foreground font-medium">
                        Plan your time-off around these scheduled company-wide holidays.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
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
                    className="bg-primary/5 border-primary/10 transition-all hover:scale-105"
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
