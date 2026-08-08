"use client";

import { useState, useEffect } from "react";
import { 
    Plus, 
    Trash2, 
    Settings, 
    Brain,
    Save,
    ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Component {
    label: string;
    type: 'Earning' | 'Deduction' | 'Employer Contribution';
    valueType: 'Fixed' | 'Percentage';
    value: number | string;
    baseComponentId?: string;
    isTaxable: boolean;
    isStatutory: boolean;
    statutoryRule?: string;
}

interface Structure {
    _id?: string;
    name: string;
    ctcAnnual: number | string;
    isActive: boolean;
    components: Component[];
}

export default function SalaryTemplatesPage() {
    const router = useRouter();
    const [structures, setStructures] = useState<Structure[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Structure | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
        let baseName = "New Structure";
        let counter = 1;
        let uniqueName = baseName;
        while (structures.some(s => s.name.toLowerCase() === uniqueName.toLowerCase())) {
            counter++;
            uniqueName = `${baseName} ${counter}`;
        }

        setEditing({
            name: uniqueName,
            ctcAnnual: 600000,
            isActive: true,
            components: [
                { label: "Basic", type: "Earning", valueType: "Percentage", value: 50, isTaxable: true, isStatutory: true, statutoryRule: "PF_BASIC" },
                { label: "HRA", type: "Earning", valueType: "Percentage", value: 25, isTaxable: true, isStatutory: false },
                { label: "Special Allowance", type: "Earning", valueType: "Fixed", value: 0, isTaxable: true, isStatutory: false },
            ]
        });
        setIsEditOpen(true);
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
        if (!editing.name || !editing.name.trim()) {
            toast.error("Template name cannot be empty");
            return;
        }

        setIsSaving(true);
        const payload = {
            ...editing,
            name: editing.name.trim(),
            ctcAnnual: Number(editing.ctcAnnual) || 0,
            components: editing.components.map(c => ({
                ...c,
                value: Number(c.value) || 0
            }))
        };
        try {
            const res = await fetch(editing._id ? `/api/admin/salary-structures/${editing._id}` : "/api/admin/salary-structures", {
                method: editing._id ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Template saved successfully");
                setEditing(null);
                setIsEditOpen(false);
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
        setDeleteTargetId(null);
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
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <Button variant="ghost" onClick={() => router.push("/admin/payroll")} className="mb-2 h-8 text-xs font-semibold">
                        <ArrowLeft className="h-3 w-3 mr-1" /> Back to Payroll
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Salary Templates</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Set up how salaries are split between different earnings and deductions.</p>
                </div>
                {!isEditOpen && (
                    <Button onClick={handleCreateNew} className="gap-2">
                        <Plus className="h-4 w-4" /> Create Template
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {structures.map((s) => (
                        <Card key={s._id} className="group hover:border-primary/40 transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="font-bold tracking-tight text-xl">{s.name}</CardTitle>
                                        <CardDescription className="font-medium text-primary">₹{((Number(s.ctcAnnual) || 0)/12).toLocaleString()} / Month (Avg)</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => {
                                            setEditing({
                                                ...s,
                                                ctcAnnual: Number(s.ctcAnnual) < 0 ? 0 : s.ctcAnnual,
                                                components: (s.components || []).map(c => ({
                                                    ...c,
                                                    value: typeof c.value === 'number' && c.value < 0 ? 0 : c.value
                                                }))
                                            });
                                            setIsEditOpen(true);
                                        }}>
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-rose-500" onClick={() => setDeleteTargetId(s._id!)}>
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
            )}

            {/* Edit/Create Template Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) setEditing(null);
            }}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                            {editing?._id ? "Edit Template" : "New Template"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Configure components and salary rules for this salary structure.
                        </DialogDescription>
                    </DialogHeader>
                    {editing && (
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="grid gap-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="tpl-name" className="text-xs font-semibold">Template Name</Label>
                                <Input
                                    id="tpl-name"
                                    className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                                    value={editing.name}
                                    onChange={(e) => setEditing({...editing, name: e.target.value})}
                                    placeholder="e.g. Standard Full-time"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tpl-salary" className="text-xs font-semibold">Annual Salary (₹)</Label>
                                <Input
                                    id="tpl-salary"
                                    type="text"
                                    inputMode="decimal"
                                    className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                                    value={editing.ctcAnnual}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                            setEditing({...editing, ctcAnnual: val});
                                        }
                                    }}
                                    placeholder="e.g. 600000"
                                />
                            </div>

                            <div className="space-y-3 pt-2 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold">Salary Components</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (!editing) return;
                                                const ctcNum = Number(editing.ctcAnnual) || 0;
                                                setEditing({
                                                    ...editing,
                                                    components: [
                                                        { label: "Basic", type: "Earning", valueType: "Percentage", value: 50, isTaxable: true, isStatutory: true, statutoryRule: "PF_BASIC" },
                                                        { label: "HRA", type: "Earning", valueType: "Percentage", value: 20, isTaxable: true, isStatutory: false },
                                                        { label: "Special Allowance", type: "Earning", valueType: "Fixed", value: Math.max(0, Math.round(((ctcNum/12) * 0.3) - 200)), isTaxable: true, isStatutory: false },
                                                        { label: "Professional Tax", type: "Deduction", valueType: "Fixed", value: 200, isTaxable: false, isStatutory: true }
                                                    ]
                                                });
                                                toast.success("Salary split applied!");
                                            }}
                                            className="h-8 text-[10px] font-semibold border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-600"
                                        >
                                            <Brain className="h-3 w-3 mr-1" /> Auto Split
                                        </Button>
                                        <Button type="button" size="sm" onClick={addComponent} variant="outline" className="h-8 text-[10px] font-semibold">
                                            <Plus className="h-3 w-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {editing.components.map((c, i) => (
                                        <div key={i} className="bg-muted/30 p-3 rounded-lg border border-muted-foreground/10 hover:border-primary/30 transition-all flex flex-col sm:flex-row gap-3 items-end">
                                            <div className="flex-1 w-full grid gap-1.5">
                                                <Label className="text-[10px] font-semibold text-muted-foreground">Label</Label>
                                                <Input
                                                    className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none bg-card"
                                                    value={c.label}
                                                    onChange={(e) => updateComponent(i, { label: e.target.value })}
                                                />
                                            </div>
                                            <div className="w-full sm:w-36 grid gap-1.5">
                                                <Label className="text-[10px] font-semibold text-muted-foreground">Type</Label>
                                                <Select value={c.type} onValueChange={(v) => updateComponent(i, { type: v as any })}>
                                                    <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Earning" className="text-xs font-medium cursor-pointer">Earning</SelectItem>
                                                        <SelectItem value="Deduction" className="text-xs font-medium cursor-pointer">Deduction</SelectItem>
                                                        <SelectItem value="Employer Contribution" className="text-xs font-medium cursor-pointer">Contribution</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-full sm:w-32 grid gap-1.5">
                                                <Label className="text-[10px] font-semibold text-muted-foreground">Value Type</Label>
                                                <Select value={c.valueType} onValueChange={(v) => updateComponent(i, { valueType: v as any })}>
                                                    <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Percentage" className="text-xs font-medium cursor-pointer">% of Base</SelectItem>
                                                        <SelectItem value="Fixed" className="text-xs font-medium cursor-pointer">Fixed Amt</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-full sm:w-24 grid gap-1.5">
                                                <Label className="text-[10px] font-semibold text-muted-foreground">Value</Label>
                                                <Input
                                                    className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none bg-card text-center"
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={c.value}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                                            updateComponent(i, { value: val });
                                                        }
                                                    }}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="flex gap-1 mb-0.5 shrink-0">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant={c.isStatutory ? "default" : "outline"}
                                                    className={cn("h-8 w-8 rounded-lg transition-all", c.isStatutory && "bg-emerald-500 hover:bg-emerald-600")}
                                                    onClick={() => updateComponent(i, { isStatutory: !c.isStatutory })}
                                                    title="Statutory Rule"
                                                >
                                                    <Settings className="h-3 w-3" />
                                                </Button>
                                                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => removeComponent(i)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="submit" disabled={isSaving} className="w-full h-9 text-xs">
                                    <Save className="h-3 w-3 mr-1" /> {isSaving ? "Saving..." : (editing._id ? "Update Template" : "Create Template")}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation AlertDialog */}
            <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this salary structure template? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(deleteTargetId!)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
