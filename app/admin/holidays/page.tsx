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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
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
            cell: ({ row }) => <div className="font-semibold text-sm text-foreground">{row.original.name}</div>
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
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
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original._id)} className="h-7 w-7 text-muted-foreground hover:text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            )
        }
    ], []);

    const upcomingHolidays = holidays.filter(h => isAfter(new Date(h.date), startOfToday())).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Holiday Calendar</h1>
                    <p className="text-xs text-muted-foreground mt-1 font-normal">
                        Manage company holidays and public observances.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 text-xs font-medium gap-1.5 rounded-lg">
                            <Plus className="h-3.5 w-3.5" /> Add Holiday
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle className="text-base font-semibold">Add New Holiday</DialogTitle>
                                <DialogDescription className="text-xs">
                                    Define a new holiday for the company calendar.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-medium">Holiday Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New Year's Day" required className="h-9 text-xs rounded-lg" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium">Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full h-9 text-xs justify-start text-left font-medium rounded-lg border-border shadow-xs",
                                                        !date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                    {date ? format(new Date(date), "MMM d, yyyy") : <span>Pick date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-xl border shadow-md" align="start">
                                                <CalendarPicker
                                                    mode="single"
                                                    selected={date ? new Date(date) : undefined}
                                                    onSelect={(d) => setDate(d ? format(d, "yyyy-MM-dd") : "")}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="type" className="text-xs font-medium">Type</Label>
                                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                                            <SelectTrigger className="w-full h-9 border-border text-xs rounded-lg shadow-xs font-medium">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Public" className="text-xs font-medium cursor-pointer">Public</SelectItem>
                                                <SelectItem value="Company" className="text-xs font-medium cursor-pointer">Company</SelectItem>
                                                <SelectItem value="Optional" className="text-xs font-medium cursor-pointer">Optional</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="submit" disabled={submitting || !date} className="w-full h-9 text-xs rounded-lg font-medium">
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
