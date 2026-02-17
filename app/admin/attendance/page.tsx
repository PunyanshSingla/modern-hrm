"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    MapPin,
    Clock,
    Calendar,
    Search,
    CheckCircle,
    XCircle,
    AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { ColumnDef } from "@tanstack/react-table";
import SearchInput from "@/components/SearchInput";

interface Attendance {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        jobTitle: string;
        departmentId?: { name: string };
    };
    date: string;
    checkInTime: string;
    checkOutTime?: string;
    location: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    status: 'Present' | 'Absent' | 'Half Day' | 'On Leave';
    approvalStatus: 'Approved' | 'Rejected';
    rejectionReason?: string;
}

export default function AttendancePage() {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Rejection State
    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        fetchAttendances();
    }, []);

    const fetchAttendances = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/attendance');
            const data = await res.json();
            if (data.success) {
                setAttendances(data.attendances || []);
            }
        } catch (error) {
            console.error("Error fetching attendances:", error);
            toast.error("Failed to fetch attendance records");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedAttendance || !rejectionReason.trim()) return;

        setIsRejecting(true);
        try {
            const res = await fetch(`/api/admin/attendance/${selectedAttendance._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    approvalStatus: 'Rejected',
                    rejectionReason
                })
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Attendance record rejected");
                setAttendances(prev => prev.map(item =>
                    item._id === selectedAttendance._id ? data.attendance : item
                ));
                setIsRejectDialogOpen(false);
                setRejectionReason("");
                setSelectedAttendance(null);
            } else {
                toast.error(data.error || "Failed to reject attendance");
            }
        } catch (error) {
            console.error("Error rejecting attendance:", error);
            toast.error("An error occurred");
        } finally {
            setIsRejecting(false);
        }
    };

    const openRejectDialog = (attendance: Attendance) => {
        setSelectedAttendance(attendance);
        setRejectionReason("");
        setIsRejectDialogOpen(true);
    };

    const columns = useMemo<ColumnDef<Attendance>[]>(() => [
        {
            accessorFn: (row) => `${row.employeeId?.firstName} ${row.employeeId?.lastName}`,
            id: "employee",
            header: "Employee",
            cell: ({ row }) => {
                const emp = row.original.employeeId;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {emp?.firstName?.[0] || ""}{emp?.lastName?.[0] || ""}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="font-medium text-sm">
                                {emp?.firstName} {emp?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {emp?.jobTitle}
                            </p>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1.5 font-medium text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {format(new Date(row.getValue("date")), "MMM d, yyyy")}
                </div>
            )
        },
        {
            accessorKey: "checkInTime",
            header: "Check In",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1.5 text-green-700 text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(row.getValue("checkInTime")), "h:mm a")}
                </div>
            )
        },
        {
            accessorKey: "checkOutTime",
            header: "Check Out",
            cell: ({ row }) => {
                const val = row.getValue("checkOutTime") as string;
                return val ? (
                    <div className="flex items-center justify-center gap-1.5 text-orange-700 text-sm">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(val), "h:mm a")}
                    </div>
                ) : (
                    <span className="text-muted-foreground text-xs italic">Active</span>
                );
            }
        },
        {
            accessorKey: "location.address",
            header: "Location",
            cell: ({ row }) => {
                const loc = row.original.location;
                return (
                    <div className="flex flex-col gap-1 text-sm items-center justify-center">
                        <div className="flex items-start gap-1.5 max-w-[150px]">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <span className="truncate">
                                {loc.address || `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`}
                            </span>
                        </div>
                        {!loc.address && (
                            <a
                                href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                            >
                                View on Map
                            </a>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const approvalStatus = row.original.approvalStatus;
                return (
                    <div className="flex flex-col gap-1 items-center justify-center">
                        <Badge variant="outline" className={`w-fit
                            ${status === 'Present' ? 'bg-green-50 text-green-700 border-green-200' :
                                status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}
                        `}>
                            {status}
                        </Badge>
                        {approvalStatus === 'Rejected' && (
                            <Badge variant="destructive" className="w-fit text-[10px] px-1.5 h-5 flex gap-1 items-center">
                                <XCircle className="h-3 w-3" /> Rejected
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const attendance = row.original;
                return (
                    <div className="text-right">
                        {attendance.approvalStatus !== 'Rejected' ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                                onClick={() => openRejectDialog(attendance)}
                            >
                                Reject
                            </Button>
                        ) : (
                            <span className="text-xs text-muted-foreground font-medium pr-2">Rejected</span>
                        )}
                    </div>
                );
            }
        }
    ], []);

    const filteredAttendances = useMemo(() => {
        return attendances.filter(item => {
            const fullName = `${item.employeeId?.firstName} ${item.employeeId?.lastName}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase()) ||
                item.employeeId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [attendances, searchQuery]);

    // Stats Logic
    const presentToday = attendances.filter(a => a.status === 'Present' && a.date.startsWith(format(new Date(), 'yyyy-MM-dd'))).length;
    const activeSessions = attendances.filter(a => !a.checkOutTime).length;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Attendance</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Monitor employee check-ins and locations in real-time.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Present Today"
                    value={presentToday}
                    description="Employees clocked in today"
                    icon={CheckCircle}
                    trend={{ value: 5, isPositive: true }}
                />
                <StatsCard
                    title="Active Sessions"
                    value={activeSessions}
                    description="Currently on premises"
                    icon={Clock}
                />
                <StatsCard
                    title="Avg. Check-in"
                    value="08:42 AM"
                    description="Organization average"
                    icon={MapPin}
                    trend={{ value: 2, isPositive: true }}
                />
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
                <div className="overflow-hidden">
                    <DataTable
                        columns={columns}
                        searchTerm={searchQuery}
                        setSearchTerm={setSearchQuery}
                        data={filteredAttendances}
                        loading={loading}
                    />
                </div>
            </div>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[32px] border-muted-foreground/10 bg-card/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" /> Reject Attendance
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Are you sure you want to reject this attendance record? This action cannot be easily undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="bg-muted/30 p-4 rounded-2xl text-sm border border-muted-foreground/10">
                            <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground mb-1">Employee</p>
                            <p className="font-bold text-base">{selectedAttendance?.employeeId.firstName} {selectedAttendance?.employeeId.lastName}</p>
                            <p className="text-muted-foreground mt-1">
                                {selectedAttendance && format(new Date(selectedAttendance.date), "PPP")} • {selectedAttendance && format(new Date(selectedAttendance.checkInTime), "h:mm a")}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="reason" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Reason for Rejection <span className="text-destructive">*</span></Label>
                            <Textarea
                                id="reason"
                                placeholder="E.g. Not at designated location, Late check-in..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="h-32 rounded-2xl bg-muted/30 border-muted-foreground/10 focus-visible:ring-destructive/30 resize-none px-4 py-3"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button variant="ghost" className="rounded-2xl h-12 font-bold" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-lg shadow-destructive/20"
                            onClick={handleReject}
                            disabled={!rejectionReason.trim() || isRejecting}
                        >
                            {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
