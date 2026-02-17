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
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground hover:text-primary">
                        <Link href="/employee/resignations">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resignations
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">Submit <span className="text-rose-600">Resignation</span></h1>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    <Card className="rounded-[40px] border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden border-l-8 border-l-rose-600">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-tight">
                                <LogOut className="h-6 w-6 text-rose-600" /> Resignation Details
                            </CardTitle>
                            <CardDescription>Provide your intended last working day and reason for leaving.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="lastWorkingDay" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Proposed Last Working Day</Label>
                                <Input 
                                    id="lastWorkingDay" 
                                    type="date" 
                                    value={formData.lastWorkingDay} 
                                    onChange={handleChange} 
                                    required 
                                    className="rounded-xl border-2 h-12 font-bold" 
                                />
                                <p className="text-[10px] text-muted-foreground font-medium ml-1">
                                    Calculated Notice Period: <span className="text-primary font-bold">{formData.noticePeriod} Days</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reason for Resignation</Label>
                                <Textarea 
                                    id="reason" 
                                    value={formData.reason} 
                                    onChange={handleChange} 
                                    placeholder="Please provide your reason for leaving... This will be shared with HR and management." 
                                    required 
                                    className="rounded-xl border-2 min-h-[150px] resize-none font-medium italic" 
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={submitting} className="w-full rounded-2xl h-14 font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 scale-100 active:scale-[0.98] transition-all bg-rose-600 hover:bg-rose-700">
                                    <Send className="mr-2 h-5 w-5" /> {submitting ? "Submitting..." : "Submit Formal Resignation"}
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium italic uppercase tracking-tighter">
                                    By submitting, you are initiating a formal separation process.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                <div className="space-y-6">
                    <Card className="rounded-[40px] border-muted-foreground/10 bg-muted/20 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase italic tracking-tight">
                                <Info className="h-5 w-5 text-primary" /> Important Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-2">
                                <h4 className="text-xs font-black uppercase">Standard Notice Period</h4>
                                <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                                    As per company policy, a standard notice period of 30 days is expected for most positions.
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-background/50 border border-border/50 space-y-2">
                                <h4 className="text-xs font-black uppercase tracking-tighter">Exit Interview</h4>
                                <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                                    Upon approval, an exit interview will be scheduled to understand your feedback.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[32px] border-amber-500/10 bg-amber-500/5 text-amber-700 shadow-sm overflow-hidden">
                        <CardContent className="pt-6 flex gap-3">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest">Caution</p>
                                <p className="text-xs font-medium leading-relaxed italic">Submission is final and initiates the offboarding flow including IT and Finance clearance.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
