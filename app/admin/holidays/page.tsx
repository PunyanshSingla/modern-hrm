"use client";

import { useState, useEffect, useMemo } from "react";
import { format, isAfter, startOfToday } from "date-fns";
import { 
    Calendar as CalendarIcon, 
    Plus, 
    Trash2, 
    CalendarHeart,
    Star,
    Info
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Holiday {
    _id: string;
    name: string;
    date: string;
    type: 'Public' | 'Company' | 'Optional';
}

export default function AdminHolidaysPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Form State
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [type, setType] = useState<Holiday['type']>("Public");
    const [submitting, setSubmitting] = useState(false);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/holidays");
            const data = await res.json();
            if (data.success) {
                setHolidays(data.holidays);
            }
        } catch (error) {
            console.error("Failed to fetch holidays", error);
            toast.error("Failed to fetch holidays");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/holidays", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, date, type }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Holiday added successfully");
                setIsDialogOpen(false);
                setName("");
                setDate("");
                setType("Public");
                fetchHolidays();
            } else {
                toast.error(data.error || "Failed to add holiday");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this holiday?")) return;
        try {
            const res = await fetch(`/api/admin/holidays?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Holiday deleted");
                fetchHolidays();
            } else {
                toast.error(data.error || "Failed to delete holiday");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

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
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original._id)} className="h-8 w-8 text-rose-500 hover:text-rose-700">
                    <Trash2 className="h-4 w-4" />
                </Button>
            )
        }
    ], []);

    const upcomingHolidays = holidays.filter(h => isAfter(new Date(h.date), startOfToday())).length;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic">Holiday Calendar</h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Manage company holidays and public observances.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            <Plus className="h-5 w-5" /> Add Holiday
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[32px] border-muted-foreground/10 bg-card/95 backdrop-blur-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Add New Holiday</DialogTitle>
                                <DialogDescription className="font-medium">
                                    Define a new holiday for the company calendar.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest ml-1">Holiday Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New Year's Day" required className="rounded-xl border-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest ml-1">Date</Label>
                                        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="rounded-xl border-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest ml-1">Type</Label>
                                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                                            <SelectTrigger className="rounded-xl border-2">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-2">
                                                <SelectItem value="Public">Public</SelectItem>
                                                <SelectItem value="Company">Company</SelectItem>
                                                <SelectItem value="Optional">Optional</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={submitting} className="w-full rounded-xl h-12 font-black uppercase tracking-tight shadow-lg shadow-primary/20">
                                    {submitting ? "Adding..." : "Add Holiday"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Total Holidays"
                    value={holidays.length}
                    description="Full calendar year"
                    icon={CalendarHeart}
                />
                <StatsCard
                    title="Upcoming"
                    value={upcomingHolidays}
                    description="In the coming days"
                    icon={Star}
                    className="bg-primary/5 border-primary/10"
                />
                <StatsCard
                    title="Policy Info"
                    value="Standard"
                    description="Based on regional labor laws"
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
