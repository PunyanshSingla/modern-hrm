"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Calendar, 
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
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 w-full sm:w-auto">
                    <Button variant="outline" size="icon" asChild className="h-11 w-11 rounded-2xl border-muted-foreground/10 shadow-sm transition-all hover:scale-105">
                        <Link href="/admin/resignations">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Review <span className="text-primary">Separation</span></h1>
                            <Badge variant="secondary" className={cn(
                                "text-[10px] px-3 py-1 uppercase tracking-widest font-black rounded-full",
                                resignation.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' :
                                resignation.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                            )}>
                                {resignation.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium flex items-center gap-2 mt-1">
                            <Clock className="h-3.5 w-3.5" /> REQ #{resignation._id.slice(-6).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Employee Info Card */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-[40px] border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden border-2">
                        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b"></div>
                        <CardContent className="pt-0 relative px-6 pb-6">
                            <div className="absolute -top-12 left-6">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black" title={`${resignation.employeeId.firstName || ''} ${resignation.employeeId.lastName || ''}`.trim() || 'Employee'}>
                                        {resignation.employeeId.firstName?.[0]?.toUpperCase() || ''}{resignation.employeeId.lastName?.[0]?.toUpperCase() || (!resignation.employeeId.firstName?.[0] ? '?' : '')}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="mt-14 space-y-6 text-center sm:text-left">
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">{resignation.employeeId.firstName} {resignation.employeeId.lastName}</h2>
                                    <p className="text-sm text-primary font-bold uppercase tracking-widest text-[10px] italic">{resignation.employeeId.position}</p>
                                </div>
                                <Separator className="bg-muted-foreground/10" />
                                <div className="space-y-4 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="h-4 w-4 text-foreground/50" />
                                        <span>{resignation.employeeId.departmentId?.name || "No Department"}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-foreground/50" />
                                        <span>{resignation.employeeId.userId?.email || "No Email"}</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all" asChild>
                                    <Link href={`/admin/employees/${resignation.employeeId._id}`}>View Full Profile</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clearance Tracking */}
                    <Card className="rounded-[40px] border-muted-foreground/10 bg-muted/5 backdrop-blur-sm shadow-sm overflow-hidden border-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-primary" /> Clearance Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div 
                                className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/50 cursor-pointer transition-all hover:bg-muted/10"
                                onClick={() => setUpdateFields(prev => ({ ...prev, clearedByIT: !prev.clearedByIT }))}
                            >
                                <span className="text-xs font-bold uppercase tracking-tight">IT Clearance</span>
                                {updateFields.clearedByIT ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Square className="h-5 w-5 text-muted-foreground/30" />}
                            </div>
                            <div 
                                className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/50 cursor-pointer transition-all hover:bg-muted/10"
                                onClick={() => setUpdateFields(prev => ({ ...prev, clearedByFinance: !prev.clearedByFinance }))}
                            >
                                <span className="text-xs font-bold uppercase tracking-tight">Finance Clearance</span>
                                {updateFields.clearedByFinance ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Square className="h-5 w-5 text-muted-foreground/30" />}
                            </div>
                            <Button onClick={() => handleUpdate()} disabled={updating} className="w-full rounded-xl font-bold uppercase text-[10px] h-10 tracking-widest">
                                Save Clearance
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Details and Actions Area */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="rounded-[40px] border-muted-foreground/10 bg-card backdrop-blur-sm shadow-xl overflow-hidden border-2">
                        <CardHeader>
                            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                <FileText className="h-6 w-6 text-primary" /> Request Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-5 rounded-3xl bg-muted/40 border-2 border-border/40">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Applied On</p>
                                    <p className="text-sm font-bold">{format(new Date(resignation.resignationDate), "MMMM d, yyyy")}</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-primary/5 border-2 border-primary/10">
                                    <p className="text-[10px] font-black uppercase text-primary mb-1">Last Working Day</p>
                                    <Input 
                                        type="date" 
                                        value={updateFields.lastWorkingDay} 
                                        onChange={(e) => setUpdateFields(prev => ({ ...prev, lastWorkingDay: e.target.value }))}
                                        className="h-8 p-0 bg-transparent border-none font-bold text-sm focus-visible:ring-0"
                                    />
                                </div>
                                <div className="p-5 rounded-3xl bg-muted/40 border-2 border-border/40">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Notice Period</p>
                                    <p className="text-sm font-bold">{resignation.noticePeriod} Days</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Employee Reason</Label>
                                <div className="p-6 rounded-[32px] bg-muted/20 border-2 border-muted-foreground/10 relative">
                                    <p className="text-sm leading-relaxed font-medium italic text-muted-foreground">"{resignation.reason}"</p>
                                </div>
                            </div>

                            <Separator className="bg-muted-foreground/10" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="exitInterviewDate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Exit Interview Date
                                    </Label>
                                    <Input 
                                        id="exitInterviewDate" 
                                        type="date" 
                                        value={updateFields.exitInterviewDate} 
                                        onChange={(e) => setUpdateFields(prev => ({ ...prev, exitInterviewDate: e.target.value }))}
                                        className="rounded-2xl border-2 h-12 font-bold" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="adminRemarks" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Remarks</Label>
                                    <Textarea 
                                        id="adminRemarks" 
                                        value={updateFields.adminRemarks} 
                                        onChange={(e) => setUpdateFields(prev => ({ ...prev, adminRemarks: e.target.value }))}
                                        placeholder="Add internal notes or instructions for offboarding..."
                                        className="rounded-2xl border-2 min-h-[100px] font-medium resize-none shadow-sm"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {resignation.status === 'Pending' && (
                        <div className="flex gap-4">
                            <Button 
                                onClick={() => handleUpdate('Rejected')} 
                                variant="outline" 
                                disabled={updating}
                                className="flex-1 rounded-[24px] h-16 bg-rose-500/5 text-rose-600 border-rose-500/20 hover:bg-rose-600 hover:text-white font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/5"
                            >
                                <XCircle className="h-6 w-6 mr-3" /> Reject Request
                            </Button>
                            <Button 
                                onClick={() => handleUpdate('Approved')} 
                                disabled={updating}
                                className="flex-1 rounded-[24px] h-16 bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20"
                            >
                                <CheckCircle className="h-6 w-6 mr-3" /> Approve Resignation
                            </Button>
                        </div>
                    )}

                    {resignation.status !== 'Pending' && (
                        <Button 
                            onClick={() => handleUpdate()} 
                            disabled={updating}
                            className="w-full rounded-[24px] h-16 font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                        >
                            <Send className="h-6 w-6 mr-3" /> Save All Updates
                        </Button>
                    )}
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
