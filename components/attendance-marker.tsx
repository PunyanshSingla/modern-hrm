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

    if (loading) return <div className="h-full flex items-center justify-center p-12 border-2 border-dashed rounded-[40px] animate-pulse bg-muted/20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    const isCheckedIn = !!attendance;
    const isCheckedOut = !!attendance?.checkOutTime;

    return (
        <Card className="h-full rounded-[40px] border-none bg-gradient-to-br from-card/50 to-background backdrop-blur-sm shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
                <Clock className="h-32 w-32 rotate-12" />
            </div>
            
            <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center justify-between">
                    <span>Presence Tracker</span>
                    <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 py-6">
                <div className="flex flex-col items-center justify-center space-y-10">
                    <div className="text-center space-y-3">
                        <div className="text-6xl font-black tracking-tighter text-foreground drop-shadow-sm font-mono italic">
                            {format(currentTime, "HH:mm:ss")}
                        </div>
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            {format(currentTime, "EEEE • MMMM d • yyyy")}
                        </div>
                    </div>

                    {locationError ? (
                        <div className="text-center space-y-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                             <div className="bg-rose-500/10 text-rose-600 p-4 rounded-3xl text-xs font-bold flex items-start gap-3 justify-center border border-rose-500/10">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <span className="text-left leading-tight">{locationError}</span>
                             </div>
                             <Button onClick={requestPermission} variant="outline" className="w-full rounded-2xl h-14 border-2 font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all duration-300">
                                <MapPin className="h-4 w-4 mr-2" /> Activate Sensor
                             </Button>
                        </div>
                    ) : (
                        <div className="w-full space-y-4">
                            {!isCheckedIn ? (
                                <Button 
                                    className="w-full h-20 text-xl font-black uppercase tracking-[0.1em] italic bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 rounded-[32px] transition-all duration-300 hover:scale-[1.02] active:scale-95 group" 
                                    onClick={() => handleMarkAttendance('check-in')}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="animate-spin h-5 w-5 border-2 border-white/50 border-white rounded-full" />
                                            Authenticating...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="h-6 w-6 animate-pulse" />
                                            Start Shift
                                        </div>
                                    )}
                                </Button>
                            ) : !isCheckedOut ? (
                                <div className="space-y-6 w-full animate-in zoom-in-95 duration-500">
                                    <div className="bg-emerald-500/10 text-emerald-600 p-5 rounded-[32px] text-center space-y-1 border border-emerald-500/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Shift Active Since</p>
                                        <p className="text-2xl font-black italic">{format(new Date(attendance.checkInTime), "h:mm a")}</p>
                                    </div>
                                    <Button 
                                        className="w-full h-20 text-xl font-black uppercase tracking-[0.1em] italic bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30 rounded-[32px] transition-all duration-300 hover:scale-[1.02] active:scale-95" 
                                        onClick={() => handleMarkAttendance('check-out')}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? "Processing..." : "Finish Shift"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-sky-500/10 text-sky-600 p-8 rounded-[40px] text-center space-y-4 border border-sky-500/10 shadow-inner w-full animate-in fade-in duration-500">
                                    <div className="h-16 w-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <Clock className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-black uppercase tracking-tight">Today's Shift Complete</p>
                                        <div className="flex items-center justify-center gap-4 text-xs font-bold opacity-80 pt-2">
                                            <div className="px-3 py-1 bg-background/50 rounded-full">IN: {format(new Date(attendance.checkInTime), "h:mm a")}</div>
                                            <div className="px-3 py-1 bg-background/50 rounded-full">OUT: {format(new Date(attendance.checkOutTime!), "h:mm a")}</div>
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
