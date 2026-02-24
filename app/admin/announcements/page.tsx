"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { 
    Megaphone, 
    Plus, 
    Trash2, 
    Bell,
    ShieldAlert,
    User as UserIcon
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface Announcement {
    _id: string;
    title: string;
    content: string;
    priority: 'Low' | 'Medium' | 'High';
    author: string;
    createdAt: string;
}

export default function AdminAnnouncementsPage() {
    const { data: session } = authClient.useSession();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState<Announcement['priority']>("Medium");
    const [submitting, setSubmitting] = useState(false);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/announcements");
            const data = await res.json();
            if (data.success) {
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            console.error("Failed to fetch announcements", error);
            toast.error("Failed to fetch announcements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title, 
                    content, 
                    priority, 
                    author: session?.user?.name || "Admin" 
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Announcement posted successfully");
                setIsDialogOpen(false);
                setTitle("");
                setContent("");
                setPriority("Medium");
                fetchAnnouncements();
            } else {
                toast.error(data.error || "Failed to post announcement");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        try {
            const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Announcement removed");
                fetchAnnouncements();
            } else {
                toast.error(data.error || "Failed to remove announcement");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const columns = useMemo<ColumnDef<Announcement>[]>(() => [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold uppercase tracking-tight">{row.original.title}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[200px] italic">"{row.original.content}"</span>
                </div>
            )
        },
        {
            accessorKey: "author",
            header: "Author",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-xs font-bold">
                    <UserIcon className="h-3 w-3 text-primary/60" />
                    {row.original.author}
                </div>
            )
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = row.original.priority;
                return (
                    <Badge variant="secondary" className={
                        priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-100' :
                        priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100' :
                        'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-100'
                    }>
                        {priority}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "createdAt",
            header: "Posted On",
            cell: ({ row }) => (
                <span className="text-sm font-medium text-muted-foreground">
                    {format(new Date(row.original.createdAt), "MMM d, yyyy")}
                </span>
            )
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

    const highPriorityCount = announcements.filter(a => a.priority === 'High').length;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic">Announcements</h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Send news and updates to all employees.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            <Plus className="h-5 w-5" /> Post News
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[32px] border-muted-foreground/10 bg-card/95 backdrop-blur-xl sm:max-w-[500px]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">New Announcement</DialogTitle>
                                <DialogDescription className="font-medium">
                                    Send an update to all employees.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest ml-1">Title</Label>
                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Annual Town Hall Meeting" required className="rounded-xl border-2" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest ml-1">Priority</Label>
                                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                                        <SelectTrigger className="rounded-xl border-2">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-2">
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content" className="text-[10px] font-black uppercase tracking-widest ml-1">Message</Label>
                                    <Textarea 
                                        id="content" 
                                        value={content} 
                                        onChange={(e) => setContent(e.target.value)} 
                                        placeholder="Type your message here..." 
                                        required 
                                        className="rounded-xl border-2 h-32 resize-none" 
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={submitting} className="w-full rounded-xl h-12 font-black uppercase tracking-tight shadow-lg shadow-primary/20">
                                    {submitting ? "Posting..." : "Post News"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Total Announcements"
                    value={announcements.length}
                    description="Past announcements"
                    icon={Bell}
                />
                <StatsCard
                    title="Urgent News"
                    value={highPriorityCount}
                    description="Please check these"
                    icon={ShieldAlert}
                    className="bg-rose-500/5 border-rose-500/10"
                />
                <StatsCard
                    title="Who can see this"
                    value="100%"
                    description="All employees"
                    icon={Megaphone}
                    className="bg-primary/5 border-primary/10"
                />
            </div>

            <div>
                <DataTable
                    columns={columns}
                    data={announcements}
                    loading={loading}
                    searchKey="title"
                />
            </div>
        </div>
    );
}
