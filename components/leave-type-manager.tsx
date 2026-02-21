"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Plus, Trash2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeaveType {
    _id: string;
    name: string;
    defaultAllowance: number;
}

export function LeaveTypeManager({ onUpdate }: { onUpdate?: () => void }) {
    const [types, setTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(false);
    const [newType, setNewType] = useState({ name: "", defaultAllowance: 0 });
    const [isOpen, setIsOpen] = useState(false);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/leave-types");
            const data = await res.json();
            if (data.success) {
                setTypes(data.leaveTypes);
            }
        } catch (error) {
            console.error("Failed to fetch leave types", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchTypes();
        }
    }, [isOpen]);

    const handleCreate = async () => {
        if (!newType.name) return;
        try {
            const res = await fetch("/api/admin/leave-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newType)
            });
            const data = await res.json();
            if (data.success) {
                setTypes([...types, data.leaveType]);
                setNewType({ name: "", defaultAllowance: 0 });
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error("Failed to create leave type", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this leave type?")) return;
        try {
            const res = await fetch(`/api/admin/leave-types/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setTypes(types.filter(t => t._id !== id));
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error("Failed to delete leave type", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Manage Types
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Manage Leave Types</DialogTitle>
                    <DialogDescription>
                        Define the types of leave available to employees (e.g., Sick, Vacation).
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-4 gap-2 items-end border-b pb-4">
                        <div className="col-span-3 space-y-1">
                            <Label htmlFor="name" className="text-xs">Name</Label>
                            <Input 
                                id="name" 
                                value={newType.name} 
                                onChange={(e) => setNewType({...newType, name: e.target.value})} 
                                placeholder="e.g. Sick Leave" 
                                className="h-8"
                            />
                        </div>
                        <Button onClick={handleCreate} size="sm" className="h-8" disabled={!newType.name}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {loading ? <p className="text-sm text-center text-muted-foreground">Loading...</p> : 
                         types.length === 0 ? <p className="text-sm text-center text-muted-foreground">No leave types defined.</p> :
                         types.map((type) => (
                            <div key={type._id} className="flex items-center justify-between p-2 rounded-md border bg-muted/40">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-sm">{type.name}</span>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(type._id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
