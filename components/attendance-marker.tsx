"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

interface AttendanceRecord {
    _id: string;
    checkInTime: string;
    checkOutTime?: string;
    status: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
}

export function AttendanceMarker() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchTodayAttendance();
        return () => clearInterval(timer);
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            const res = await fetch("/api/employee/attendance");
            const data = await res.json();
            if (data.success) {
                setAttendance(data.attendance);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const getLocation = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
            } else {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            }
        });
    };

    const handleMarkAttendance = async (action: 'check-in' | 'check-out') => {
        setActionLoading(true);
        setLocationError(null);

        try {
            const position = await getLocation();
            const { latitude, longitude } = position.coords;

            const res = await fetch("/api/employee/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    location: {
                        latitude,
                        longitude,
                    }
                })
            });

            const data = await res.json();
            if (data.success) {
                setAttendance(data.attendance);
                toast.success(action === 'check-in' ? "Checked in successfully!" : "Checked out successfully!");
            } else {
                toast.error(data.error);
            }
        } catch (error: any) {
            console.error("Error marking attendance:", error);
            if (error.code === error.PERMISSION_DENIED) {
                setLocationError("Location permission is required to mark attendance.");
                toast.error("Please enable location services.");
            } else {
                toast.error("Failed to get location or mark attendance.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const requestPermission = () => {
        setLocationError(null);
        getLocation().then(() => {
             toast.success("Location permission granted!");
        }).catch((error) => {
             if (error.code === error.PERMISSION_DENIED) {
                setLocationError("Location permission is still denied. Please reset permissions in your browser settings.");
            }
        });
    };

    if (loading) return (
        <div className="h-full min-h-[300px] flex items-center justify-center p-8 border border-border/60 rounded-2xl animate-pulse bg-card">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div>
        </div>
    );

    const isCheckedIn = !!attendance;
    const isCheckedOut = !!attendance?.checkOutTime;

    return (
        <Card className="rounded-xl border border-border bg-card p-5 shadow-xs relative overflow-hidden">
            <CardHeader className="p-0 pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
                    <span>Daily Attendance</span>
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-5">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="text-center space-y-0.5">
                        <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
                            {format(currentTime, "HH:mm:ss")}
                        </div>
                        <p className="text-xs font-normal text-muted-foreground">
                            {format(currentTime, "EEEE, MMMM d, yyyy")}
                        </p>
                    </div>

                    {locationError ? (
                        <div className="text-center space-y-3 w-full animate-in fade-in duration-200">
                             <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 border border-rose-200 dark:border-rose-900/50">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span className="text-left leading-snug">{locationError}</span>
                             </div>
                             <Button onClick={requestPermission} variant="outline" className="w-full rounded-xl h-11 border font-medium text-xs">
                                <MapPin className="h-4 w-4 mr-2" /> Enable Location Services
                             </Button>
                        </div>
                    ) : (
                        <div className="w-full space-y-4 pt-2">
                            {!isCheckedIn ? (
                                <Button 
                                    className="w-full h-9 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs rounded-lg transition-all duration-200" 
                                    onClick={() => handleMarkAttendance('check-in')}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="animate-spin h-3.5 w-3.5 border-2 border-white/50 border-t-white rounded-full" />
                                            Checking in...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Clock In
                                        </div>
                                    )}
                                </Button>
                            ) : !isCheckedOut ? (
                                <div className="space-y-4 w-full animate-in fade-in duration-300">
                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-center space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Clocked in at</p>
                                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{format(new Date(attendance.checkInTime), "h:mm a")}</p>
                                        {attendance.location?.latitude && (
                                            <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground pt-1">
                                                <MapPin className="h-3 w-3" />
                                                <span className="tabular-nums">
                                                    {attendance.location.latitude.toFixed(4)}, {attendance.location.longitude.toFixed(4)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        className="w-full h-12 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md rounded-xl transition-all duration-200 active:scale-[0.98]" 
                                        onClick={() => handleMarkAttendance('check-out')}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? "Processing..." : "Clock Out"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 p-5 rounded-xl text-center space-y-3 border border-sky-200 dark:border-sky-900/50 w-full">
                                    <div className="h-10 w-10 bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 rounded-full flex items-center justify-center mx-auto">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-foreground">Shift Completed</p>
                                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
                                            <span className="px-2.5 py-1 bg-background rounded-md border border-border/50">In: {format(new Date(attendance.checkInTime), "h:mm a")}</span>
                                            <span className="px-2.5 py-1 bg-background rounded-md border border-border/50">Out: {format(new Date(attendance.checkOutTime!), "h:mm a")}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
