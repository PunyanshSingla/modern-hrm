"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    LogOut, 
    MessageSquare, 
    Send,
    ArrowLeft,
    Calendar,
    AlertCircle,
    Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { addDays, format, differenceInDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function NewResignationPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        lastWorkingDay: format(addDays(new Date(), 30), "yyyy-MM-dd"), // Default 30 days notice
        reason: "",
        noticePeriod: 30
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        
        if (id === "lastWorkingDay") {
            const today = new Date();
            const lastDay = new Date(value);
            const diff = differenceInDays(lastDay, today);
            setFormData(prev => ({ ...prev, [id]: value, noticePeriod: diff }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.noticePeriod < 0) {
            toast.error("Last working day must be in the future");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/employee/resignations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Resignation submitted successfully");
                router.push("/employee/resignations");
            } else {
                toast.error(data.error || "Failed to submit resignation");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-1 -ml-2 text-muted-foreground hover:text-primary h-7 text-xs font-medium">
                        <Link href="/employee/resignations">
                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Resignations
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Submit Resignation</h1>
                    <p className="text-xs text-muted-foreground mt-0.5 font-normal">Initiate formal separation request and offboarding timeline.</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    <Card className="rounded-xl border border-border shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <LogOut className="h-4 w-4 text-rose-600" /> Resignation Details
                            </CardTitle>
                            <CardDescription className="text-xs">Select your proposed last working day and reason for leaving.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Proposed Last Working Day</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full h-9 text-xs justify-start text-left font-medium rounded-lg border-border shadow-xs",
                                                !formData.lastWorkingDay && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-3.5 w-3.5" />
                                            {formData.lastWorkingDay ? format(new Date(formData.lastWorkingDay), "PPP") : <span>Pick last working day</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-xl border shadow-md" align="start">
                                        <CalendarPicker
                                            mode="single"
                                            selected={formData.lastWorkingDay ? new Date(formData.lastWorkingDay) : undefined}
                                            onSelect={(d) => {
                                                if (d) {
                                                    const formatted = format(d, "yyyy-MM-dd");
                                                    const diff = differenceInDays(d, new Date());
                                                    setFormData(prev => ({ ...prev, lastWorkingDay: formatted, noticePeriod: diff }));
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <p className="text-[11px] text-muted-foreground font-normal">
                                    Calculated Notice Period: <span className="text-primary font-semibold">{formData.noticePeriod} Days</span>
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="reason" className="text-xs font-medium text-muted-foreground">Reason for Resignation</Label>
                                <Textarea 
                                    id="reason" 
                                    value={formData.reason} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))} 
                                    placeholder="Provide reason for resignation..." 
                                    required 
                                    className="rounded-lg min-h-[110px] text-xs font-medium resize-none shadow-xs" 
                                />
                            </div>

                            <div className="pt-2 flex flex-col items-end gap-2">
                                <Button type="submit" disabled={submitting} className="rounded-lg h-9 px-6 text-xs font-medium shadow-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white">
                                    <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : "Submit Formal Resignation"}
                                </Button>
                                <p className="text-[11px] text-muted-foreground font-normal">
                                    Submitting initiates formal offboarding clearance with HR and Management.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                <div className="space-y-6">
                    <Card className="rounded-xl border border-border shadow-xs bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <Info className="h-4 w-4 text-primary" /> Important Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/60 space-y-1">
                                <h4 className="text-xs font-semibold text-foreground">Standard Notice Period</h4>
                                <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                                    Standard notice period requirement is 30 days as per employment agreement.
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/60 space-y-1">
                                <h4 className="text-xs font-semibold text-foreground">Exit Clearance & Interview</h4>
                                <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                                    Upon approval, exit interview and IT asset clearance will be scheduled.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-xs">
                        <CardContent className="p-4 flex gap-3">
                            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-amber-800">Notice</p>
                                <p className="text-xs font-normal text-amber-700/90 leading-relaxed">Resignation submission is irreversible once approved by administration.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
