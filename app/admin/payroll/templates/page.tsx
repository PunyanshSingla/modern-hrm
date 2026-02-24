"use client";

import { useState, useEffect } from "react";
import { 
    Plus, 
    Trash2, 
    Settings, 
    Check, 
    X, 
    Brain,
    Save,
    Calendar,
    ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Component {
    label: string;
    type: 'Earning' | 'Deduction' | 'Employer Contribution';
    valueType: 'Fixed' | 'Percentage';
    value: number;
    baseComponentId?: string;
    isTaxable: boolean;
    isStatutory: boolean;
    statutoryRule?: string;
}

interface Structure {
    _id?: string;
    name: string;
    ctcAnnual: number;
    isActive: boolean;
    components: Component[];
}

export default function SalaryTemplatesPage() {
    const router = useRouter();
    const [structures, setStructures] = useState<Structure[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Structure | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchStructures = async () => {
        try {
            const res = await fetch("/api/admin/salary-structures");
            const data = await res.json();
            if (data.success) setStructures(data.structures);
        } catch (error) {
            toast.error("Failed to fetch templates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStructures(); }, []);

    const handleCreateNew = () => {
        setEditing({
            name: "New Structure",
            ctcAnnual: 600000,
            isActive: true,
            components: [
                { label: "Basic", type: "Earning", valueType: "Percentage", value: 50, isTaxable: true, isStatutory: true, statutoryRule: "PF_BASIC" },
                { label: "HRA", type: "Earning", valueType: "Percentage", value: 25, isTaxable: true, isStatutory: false },
                { label: "Special Allowance", type: "Earning", valueType: "Fixed", value: 0, isTaxable: true, isStatutory: false },
            ]
        });
    };

    const addComponent = () => {
        if (!editing) return;
        setEditing({
            ...editing,
            components: [...editing.components, { label: "New Component", type: "Earning", valueType: "Fixed", value: 0, isTaxable: true, isStatutory: false }]
        });
    };

    const removeComponent = (index: number) => {
        if (!editing) return;
        const newComponents = [...editing.components];
        newComponents.splice(index, 1);
        setEditing({ ...editing, components: newComponents });
    };

    const updateComponent = (index: number, fields: Partial<Component>) => {
        if (!editing) return;
        const newComponents = [...editing.components];
        newComponents[index] = { ...newComponents[index], ...fields };
        setEditing({ ...editing, components: newComponents });
    };

    const handleSave = async () => {
        if (!editing) return;
        setIsSaving(true);
        try {
            const res = await fetch(editing._id ? `/api/admin/salary-structures/${editing._id}` : "/api/admin/salary-structures", {
                method: editing._id ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Template saved successfully");
                setEditing(null);
                fetchStructures();
            } else {
                toast.error(data.error || "Failed to save template");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            const res = await fetch(`/api/admin/salary-structures/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Template deleted");
                fetchStructures();
            }
        } catch (error) {
            toast.error("Failed to delete template");
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => router.push("/admin/payroll")} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Payroll
                    </Button>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic">Salary Templates</h1>
                    <p className="text-muted-foreground font-medium">Set up how salaries are split between different earnings and deductions.</p>
                </div>
                {!editing && (
                    <Button onClick={handleCreateNew} className="rounded-xl h-12 px-6 font-black uppercase tracking-tight shadow-lg shadow-primary/20">
                        <Plus className="h-5 w-5 mr-2" /> Create Template
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : !editing ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {structures.map((s) => (
                        <Card key={s._id} className="group hover:border-primary/40 transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="font-black uppercase italic tracking-tight text-xl">{s.name}</CardTitle>
                                        <CardDescription className="font-bold text-primary">₹{(s.ctcAnnual/12).toLocaleString()} / Month (Avg)</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => setEditing(s)}>
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-rose-500" onClick={() => handleDelete(s._id!)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {s.components.slice(0, 3).map((c, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm font-bold border-b border-muted py-1">
                                            <span className="text-muted-foreground uppercase text-[10px]">{c.label}</span>
                                            <span>{c.valueType === 'Percentage' ? `${c.value}%` : `₹${c.value}`}</span>
                                        </div>
                                    ))}
                                    {s.components.length > 3 && (
                                        <p className="text-[10px] font-black text-center text-muted-foreground uppercase pt-2">+{s.components.length - 3} More Components</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-2 border-primary/20 shadow-2xl">
                    <CardHeader className="bg-primary/5 border-b pb-6">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black uppercase italic tracking-tight">
                                    {editing._id ? "Edit Template" : "New Template"}
                                </CardTitle>
                                <p className="text-sm font-bold text-muted-foreground uppercase">Configure components and salary rules</p>
                            </div>
                            <div className="flex gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        if (!editing) return;
                                        setEditing({
                                            ...editing,
                                            components: [
                                                { label: "Basic", type: "Earning", valueType: "Percentage", value: 50, isTaxable: true, isStatutory: true, statutoryRule: "PF_BASIC" },
                                                { label: "HRA", type: "Earning", valueType: "Percentage", value: 20, isTaxable: true, isStatutory: false },
                                                { label: "Special Allowance", type: "Earning", valueType: "Fixed", value: Math.round(((editing.ctcAnnual/12) * 0.3) - 200), isTaxable: true, isStatutory: false },
                                                { label: "Professional Tax", type: "Deduction", valueType: "Fixed", value: 200, isTaxable: false, isStatutory: true }
                                            ]
                                        });
                                        toast.success("Salary split applied!");
                                    }} 
                                    className="font-black uppercase tracking-widest text-[10px] border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-600"
                                >
                                    <Brain className="h-4 w-4 mr-2" /> Auto Split
                                </Button>
                                <Button variant="ghost" onClick={() => setEditing(null)} className="font-black uppercase tracking-widest text-[10px]">
                                    <X className="h-4 w-4 mr-2" /> Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-black uppercase tracking-tight h-10 px-6">
                                    <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Template"}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Template Name</label>
                                <Input 
                                    className="h-12 rounded-xl text-lg font-bold border-2 focus:border-primary transition-all" 
                                    value={editing.name} 
                                    onChange={(e) => setEditing({...editing, name: e.target.value})}
                                    placeholder="e.g. Standard Full-time"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Annual Salary</label>
                                <Input 
                                    type="number"
                                    className="h-12 rounded-xl text-lg font-bold border-2 focus:border-primary transition-all" 
                                    value={editing.ctcAnnual} 
                                    onChange={(e) => setEditing({...editing, ctcAnnual: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b pb-4">
                                <h3 className="font-black uppercase italic tracking-tighter text-xl text-primary">Salary Components</h3>
                                <Button size="sm" onClick={addComponent} variant="outline" className="rounded-lg h-9 font-bold border-2">
                                    <Plus className="h-4 w-4 mr-1" /> Add Component
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {editing.components.map((c, i) => (
                                    <div key={i} className="group relative bg-muted/30 p-4 rounded-2xl border border-muted-foreground/10 hover:border-primary/30 transition-all flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 w-full space-y-2">
                                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Label</label>
                                            <Input 
                                                className="bg-background font-bold h-10 rounded-lg" 
                                                value={c.label} 
                                                onChange={(e) => updateComponent(i, { label: e.target.value })}
                                            />
                                        </div>
                                        <div className="w-full md:w-32 space-y-2">
                                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Type</label>
                                            <select 
                                                className="w-full h-10 rounded-lg border bg-background px-2 text-xs font-bold"
                                                value={c.type}
                                                onChange={(e) => updateComponent(i, { type: e.target.value as any })}
                                            >
                                                <option value="Earning">Earning</option>
                                                <option value="Deduction">Deduction</option>
                                                <option value="Employer Contribution">Contribution</option>
                                            </select>
                                        </div>
                                        <div className="w-full md:w-28 space-y-2">
                                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Value Type</label>
                                            <select 
                                                className="w-full h-10 rounded-lg border bg-background px-2 text-xs font-bold"
                                                value={c.valueType}
                                                onChange={(e) => updateComponent(i, { valueType: e.target.value as any })}
                                            >
                                                <option value="Percentage">% of Base</option>
                                                <option value="Fixed">Fixed Amt</option>
                                            </select>
                                        </div>
                                        <div className="w-full md:w-24 space-y-2">
                                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Value</label>
                                            <Input 
                                                className="bg-background font-bold h-10 rounded-lg text-center" 
                                                type="number"
                                                value={c.value} 
                                                onChange={(e) => updateComponent(i, { value: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className="flex gap-2 mb-1">
                                            <Button 
                                                size="icon" 
                                                variant={c.isStatutory ? "default" : "outline"}
                                                className={cn("h-10 w-10 rounded-xl transition-all", c.isStatutory && "bg-emerald-500 hover:bg-emerald-600")}
                                                onClick={() => updateComponent(i, { isStatutory: !c.isStatutory })}
                                                title="Statutory Rule"
                                            >
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-10 w-10 text-rose-500" onClick={() => removeComponent(i)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
