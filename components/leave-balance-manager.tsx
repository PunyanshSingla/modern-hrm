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
import { WalletCards, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeaveType {
    _id: string;
    name: string;
    color: string;
}

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    leaveBalances: {
        leaveTypeId: string | LeaveType; // Can be populated or ID
        balance: number;
    }[];
}

export function LeaveBalanceManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [types, setTypes] = useState<LeaveType[]>([]);
    const [search, setSearch] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [balances, setBalances] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch employees and types in parallel
            const [empRes, typeRes] = await Promise.all([
                fetch("/api/admin/employees"),
                fetch("/api/admin/leave-types")
            ]);
            
            // Note: Assuming /api/admin/employees works and lists employees. 
            // If it pagination, we might just get first page or need a specific search endpoint.
            // For now, let's assume it returns a list.
            const empData = await empRes.json();
            const typeData = await typeRes.json();

            if (empData.success) setEmployees(empData.employees);
            if (typeData.success) setTypes(typeData.leaveTypes);

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const handleSelectEmployee = (emp: Employee) => {
        setSelectedEmployee(emp);
        
        // Initialize balances
        const initialBalances: Record<string, number> = {};
        types.forEach(type => {
            const existing = emp.leaveBalances?.find(b => 
                (typeof b.leaveTypeId === 'string' ? b.leaveTypeId : b.leaveTypeId._id) === type._id
            );
            initialBalances[type._id] = existing ? existing.balance : 0;
        });
        setBalances(initialBalances);
    };

    const handleSave = async () => {
        if (!selectedEmployee) return;
        setSaving(true);
        try {
            // Construct the leaveBalances array for the API
            const leaveBalances = Object.entries(balances).map(([typeId, balance]) => ({
                leaveTypeId: typeId,
                balance
            }));

            const res = await fetch(`/api/admin/employees/${selectedEmployee._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leaveBalances }) // Note: The API needs to handle this array structure now
            });
            
            const data = await res.json();
            if (data.success) {
                // Update local list
                setEmployees(prev => prev.map(e => e._id === selectedEmployee._id ? { ...e, leaveBalances: data.profile.leaveBalances } : e));
                setSelectedEmployee(null);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Failed to save balances", error);
        } finally {
            setSaving(false);
        }
    };

    const filteredEmployees = employees.filter(e => 
        e.firstName.toLowerCase().includes(search.toLowerCase()) || 
        e.lastName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <WalletCards className="h-4 w-4" />
                    Manage Balances
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[500px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Manage Employee Balances</DialogTitle>
                    <DialogDescription>
                        Select an employee to manually update their leave balances.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-6 flex-1 min-h-0 pt-4">
                    {/* Left: Employee List */}
                    <div className="w-1/3 flex flex-col gap-2 border-r pr-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input 
                                placeholder="Search..." 
                                className="pl-8 h-9 text-sm" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="space-y-1">
                                {loading ? <p className="text-xs text-center text-muted-foreground p-2">Loading...</p> :
                                 filteredEmployees.map(emp => (
                                    <button
                                        key={emp._id}
                                        onClick={() => handleSelectEmployee(emp)}
                                        className={`w-full text-left p-2 rounded-md text-sm flex items-center gap-2 hover:bg-accent ${selectedEmployee?._id === emp._id ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}`}
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[10px]" title={`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee'}>
                                                {emp.firstName?.[0]?.toUpperCase() || ''}{emp.lastName?.[0]?.toUpperCase() || (!emp.firstName?.[0] ? '?' : '')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{emp.firstName} {emp.lastName}</span>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right: Balance Inputs */}
                    <div className="flex-1 flex flex-col">
                        {selectedEmployee ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-4 border-b">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback title={`${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim() || 'Selected'}>
                                            {selectedEmployee.firstName?.[0]?.toUpperCase() || ''}{selectedEmployee.lastName?.[0]?.toUpperCase() || (!selectedEmployee.firstName?.[0] ? '?' : '')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{selectedEmployee.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {types.map(type => (
                                        <div key={type._id} className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">{type.name}</Label>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: type.color }} />
                                                <Input 
                                                    type="number" 
                                                    value={balances[type._id] ?? 0}
                                                    onChange={(e) => setBalances(prev => ({ ...prev, [type._id]: Number(e.target.value) }))}
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 mt-auto flex justify-end">
                                    <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                                        {saving ? "Saving..." : "Save Balances"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                                Select an employee to edit balances
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
