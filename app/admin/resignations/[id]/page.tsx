"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Calendar as CalendarIcon, 
    User, 
    FileText, 
    Clock, 
    Mail, 
    Briefcase,
    AlertCircle,
    CheckSquare,
    Square
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

interface Resignation {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        position: string;
        departmentId?: { name: string };
        userId?: { email: string };
    };
    resignationDate: string;
    lastWorkingDay: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';
    noticePeriod: number;
    adminRemarks?: string;
    exitInterviewDate?: string;
    clearedByIT: boolean;
    clearedByFinance: boolean;
    createdAt: string;
}

export default function ResignationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [resignation, setResignation] = useState<Resignation | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // Form for updates
    const [updateFields, setUpdateFields] = useState({
        adminRemarks: "",
        exitInterviewDate: "",
        clearedByIT: false,
        clearedByFinance: false,
        lastWorkingDay: ""
    });

    const fetchResignation = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/resignations");
            const data = await res.json();
            if (data.success) {
                const found = data.resignations.find((r: Resignation) => r._id === id);
                if (found) {
                    setResignation(found);
                    setUpdateFields({
                        adminRemarks: found.adminRemarks || "",
                        exitInterviewDate: found.exitInterviewDate ? format(new Date(found.exitInterviewDate), "yyyy-MM-dd") : "",
                        clearedByIT: found.clearedByIT,
                        clearedByFinance: found.clearedByFinance,
                        lastWorkingDay: format(new Date(found.lastWorkingDay), "yyyy-MM-dd")
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching resignation details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResignation();
    }, [id]);

    const handleUpdate = async (status?: string) => {
        setUpdating(true);
        try {
            const body = {
                ...updateFields,
                status: status || resignation?.status
            };

            const res = await fetch(`/api/admin/resignations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Resignation updated successfully");
                fetchResignation();
            } else {
                toast.error(data.error || "Failed to update");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    if (!resignation) return <div className="p-8 text-center">Resignation not found. <Link href="/admin/resignations" className="text-primary hover:underline">Back to list</Link></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild className="h-8 w-8 rounded-lg p-0">
                        <Link href="/admin/resignations">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Review Resignation Request</h1>
                            <Badge variant="outline" className={cn(
                                "text-xs font-medium px-2.5 py-0.5 border capitalize",
                                resignation.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                                resignation.status === 'Rejected' ? 'bg-rose-500/10 text-rose-700 border-rose-500/20' :
                                'bg-amber-500/10 text-amber-700 border-amber-500/20'
                            )}>
                                {resignation.status}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 font-normal">
                            <Clock className="h-3 w-3" /> REQ #{resignation._id.slice(-6).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Employee Info Card */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-xl border border-border shadow-xs">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-3.5">
                                <Avatar className="h-14 w-14 border border-border shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold" title={`${resignation.employeeId.firstName || ''} ${resignation.employeeId.lastName || ''}`.trim() || 'Employee'}>
                                        {resignation.employeeId.firstName?.[0]?.toUpperCase() || ''}{resignation.employeeId.lastName?.[0]?.toUpperCase() || (!resignation.employeeId.firstName?.[0] ? '?' : '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-foreground tracking-tight truncate">{resignation.employeeId.firstName} {resignation.employeeId.lastName}</h2>
                                    <p className="text-xs text-muted-foreground font-normal truncate">{resignation.employeeId.position || "Staff"}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2.5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2.5">
                                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70" />
                                    <span className="font-medium text-foreground">{resignation.employeeId.departmentId?.name || "No Department"}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                                    <span className="font-medium text-foreground truncate">{resignation.employeeId.userId?.email || "No Email"}</span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full rounded-lg h-8 text-xs font-medium" asChild>
                                <Link href={`/admin/employees/${resignation.employeeId._id}`}>View Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Clearance Tracking */}
                    <Card className="rounded-xl border border-border shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2 text-foreground">
                                <CheckSquare className="h-4 w-4 text-primary" /> Clearance Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div 
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/60 cursor-pointer transition-all hover:bg-muted/50"
                                onClick={() => setUpdateFields(prev => ({ ...prev, clearedByIT: !prev.clearedByIT }))}
                            >
                                <span className="text-xs font-medium text-foreground">IT Clearance</span>
                                {updateFields.clearedByIT ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4 text-muted-foreground/40" />}
                            </div>
                            <div 
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/60 cursor-pointer transition-all hover:bg-muted/50"
                                onClick={() => setUpdateFields(prev => ({ ...prev, clearedByFinance: !prev.clearedByFinance }))}
                            >
                                <span className="text-xs font-medium text-foreground">Finance Clearance</span>
                                {updateFields.clearedByFinance ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4 text-muted-foreground/40" />}
                            </div>
                            <div className="flex justify-end pt-1">
                                <Button onClick={() => handleUpdate()} disabled={updating} size="sm" className="h-8 px-4 rounded-lg text-xs font-medium">
                                    Save Clearance
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details and Actions Area */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-xl border border-border shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2 text-foreground">
                                <FileText className="h-4 w-4 text-primary" /> Request Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3.5 rounded-lg bg-muted/30 border border-border/60">
                                    <p className="text-[11px] font-medium text-muted-foreground mb-1">Applied On</p>
                                    <p className="text-xs font-semibold text-foreground">{format(new Date(resignation.resignationDate), "MMMM d, yyyy")}</p>
                                </div>
                                <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20">
                                    <p className="text-[11px] font-medium text-primary mb-1">Last Working Day</p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "h-7 p-0 bg-transparent hover:bg-transparent font-semibold text-xs text-foreground justify-start shadow-none",
                                                    !updateFields.lastWorkingDay && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-primary" />
                                                {updateFields.lastWorkingDay ? format(new Date(updateFields.lastWorkingDay), "MMM d, yyyy") : <span>Select date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-xl border shadow-md" align="start">
                                            <CalendarPicker
                                                mode="single"
                                                selected={updateFields.lastWorkingDay ? new Date(updateFields.lastWorkingDay) : undefined}
                                                onSelect={(date) => setUpdateFields(prev => ({ ...prev, lastWorkingDay: date ? format(date, "yyyy-MM-dd") : "" }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="p-3.5 rounded-lg bg-muted/30 border border-border/60">
                                    <p className="text-[11px] font-medium text-muted-foreground mb-1">Notice Period</p>
                                    <p className="text-xs font-semibold text-foreground">{resignation.noticePeriod} Days</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Employee Reason</Label>
                                <div className="p-4 rounded-lg bg-muted/30 border border-border/60">
                                    <p className="text-xs leading-relaxed text-foreground font-normal">"{resignation.reason}"</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                        <CalendarIcon className="h-3.5 w-3.5" /> Exit Interview Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-9 text-xs justify-start text-left font-medium rounded-lg border-border shadow-xs",
                                                    !updateFields.exitInterviewDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                {updateFields.exitInterviewDate ? format(new Date(updateFields.exitInterviewDate), "PPP") : <span>Pick exit interview date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-xl border shadow-md" align="start">
                                            <CalendarPicker
                                                mode="single"
                                                selected={updateFields.exitInterviewDate ? new Date(updateFields.exitInterviewDate) : undefined}
                                                onSelect={(date) => setUpdateFields(prev => ({ ...prev, exitInterviewDate: date ? format(date, "yyyy-MM-dd") : "" }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adminRemarks" className="text-xs font-medium text-muted-foreground">Admin Remarks</Label>
                                    <Textarea 
                                        id="adminRemarks" 
                                        value={updateFields.adminRemarks} 
                                        onChange={(e) => setUpdateFields(prev => ({ ...prev, adminRemarks: e.target.value }))}
                                        placeholder="Add internal notes or instructions for offboarding..."
                                        className="rounded-lg min-h-[90px] text-xs font-medium resize-none shadow-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                {resignation.status === 'Pending' ? (
                                    <>
                                        <Button 
                                            onClick={() => handleUpdate('Rejected')} 
                                            variant="outline" 
                                            disabled={updating}
                                            className="h-8 px-4 rounded-lg bg-rose-500/5 text-rose-600 border-rose-500/20 hover:bg-rose-500/10 font-medium text-xs shadow-xs"
                                        >
                                            <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject Request
                                        </Button>
                                        <Button 
                                            onClick={() => handleUpdate('Approved')} 
                                            disabled={updating}
                                            className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs"
                                        >
                                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Approve Resignation
                                        </Button>
                                    </>
                                ) : (
                                    <Button 
                                        onClick={() => handleUpdate()} 
                                        disabled={updating}
                                        className="h-8 px-4 rounded-lg text-xs font-medium shadow-xs"
                                    >
                                        <Send className="h-3.5 w-3.5 mr-1.5" /> Save All Updates
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Re-using some icons from the context
function Send(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}
