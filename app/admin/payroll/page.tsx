"use client";

import { useState, useEffect, useMemo } from "react";
import { 
    Banknote, 
    Edit, 
    Check, 
    X,
    TrendingUp,
    Users as UsersIcon,
    Wallet,
    Settings,
    Plus,
    Calendar
} from "lucide-react";

import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    position: string;
    departmentId?: { name: string };
    baseSalary: number;
    status: string;
    payrollStatus?: 'Draft' | 'Generated' | 'Approved' | 'Paid' | 'Closed';
    payrollData?: any;
    attendanceStats?: {
        totalDays: number;
        paidDays: number;
        lopDays: number;
        presentDays: number;
        halfDays: number;
        leaveDays: number;
        holidayDays: number;
        effectiveWorkingDays: number;
        actualPayout: number;
    };
    calculation?: {
        earnings: { label: string; amount: number }[];
        deductions: { label: string; amount: number; category: string }[];
        statutory: any;
        totalEarnings: number;
        totalDeductions: number;
        netPayable: number;
    };
}

export default function AdminPayrollPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempSalary, setTempSalary] = useState<string>("");
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [adjustments, setAdjustments] = useState<Record<string, any[]>>({});

    const steps = [
        { id: 1, title: "Attendance & Pro-rata", desc: "Review working days" },
        { id: 2, title: "Variances", desc: "Add bonuses & deductions" },
        { id: 3, title: "Finalize", desc: "Generate & Approve" }
    ];

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/payroll?month=${month}&year=${year}`);
            const data = await res.json();
            if (data.success) {
                setEmployees(data.employees);
            }
        } catch (error) {
            console.error("Failed to fetch payroll data", error);
            toast.error("Failed to fetch payroll data");
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePayroll = async () => {
        if (!confirm(`Are you sure you want to generate payroll for ${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(year, month))} ${year}?`)) return;
        
        setGenerating(true);
        try {
            const res = await fetch("/api/admin/payroll/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month, year, adjustments })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Payroll generated for ${data.count} employees`);
                fetchEmployees();
            } else {
                toast.error(data.error || "Failed to generate payroll");
            }
        } catch (error) {
            toast.error("An error occurred during generation");
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [month, year]);

    const handleUpdateSalary = async (id: string) => {
        const salary = parseFloat(tempSalary);
        if (isNaN(salary)) {
            toast.error("Invalid salary amount");
            return;
        }

        try {
            const res = await fetch("/api/admin/payroll", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, baseSalary: salary }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Salary updated successfully");
                setEditingId(null);
                fetchEmployees();
            } else {
                toast.error(data.error || "Failed to update salary");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const columns = useMemo<ColumnDef<Employee>[]>(() => [
        {
            accessorKey: "name",
            header: "Employee",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold uppercase tracking-tight">{row.original.firstName} {row.original.lastName}</span>
                    <span className="text-[10px] font-black uppercase text-muted-foreground opacity-70 tracking-widest">{row.original.position}</span>
                </div>
            )
        },
        {
            accessorKey: "departmentId.name",
            header: "Department",
            cell: ({ row }) => row.original.departmentId?.name ? (
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-primary/20 text-primary bg-primary/5">
                    {row.original.departmentId.name}
                </Badge>
            ) : "-"
        },
        {
            accessorKey: "baseSalary",
            header: "Monthly Salary",
            cell: ({ row }) => {
                const isEditing = editingId === row.original._id;
                return (
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Input 
                                    className="h-8 w-24 rounded-lg font-bold" 
                                    value={tempSalary} 
                                    onChange={(e) => setTempSalary(e.target.value)} 
                                    type="number"
                                />
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => handleUpdateSalary(row.original._id)}>
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => setEditingId(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <span className="font-mono font-black text-foreground">
                                    ₹ {row.original.baseSalary?.toLocaleString() || "0"}
                                </span>
                                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                                    setEditingId(row.original._id);
                                    setTempSalary(row.original.baseSalary.toString());
                                }}>
                                    <Edit className="h-3.5 w-3.5 text-primary" />
                                </Button>
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "attendanceStats",
            header: "Activity Breakdown",
            cell: ({ row }) => {
                const isGenerated = ['Generated', 'Approved', 'Paid', 'Closed'].includes(row.original.payrollStatus || '');
                const stats = isGenerated ? row.original.payrollData.attendanceSnapshot : row.original.attendanceStats;
                if (!stats) return "-";
                return (
                    <div className="flex flex-col text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                        <span className="text-foreground/80">{stats.paidDays} Paid / {stats.totalDays} Total</span>
                        <div className="flex gap-2 opacity-60">
                            <span className="text-emerald-500">{stats.presentDays}P</span>
                            <span className="text-amber-500">{stats.leaveDays}L</span>
                            <span className="text-rose-500">{stats.lopDays} LOP</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "actualPayout",
            header: "Net Payable",
            cell: ({ row }) => {
                const isGenerated = ['Generated', 'Approved', 'Paid', 'Closed'].includes(row.original.payrollStatus || '');
                const calc = isGenerated ? row.original.payrollData : row.original.calculation;
                const payout = calc?.netPayable;
                const deductions = calc?.totalDeductions;

                return (
                    <div className="flex flex-col gap-1 items-start">
                        <Badge className={cn(
                            "border-none font-black text-xs tabular-nums px-3",
                            isGenerated ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary"
                        )}>
                            ₹{payout?.toLocaleString() || "0"}
                        </Badge>
                        {deductions > 0 && (
                            <div className="flex gap-1.5 items-center">
                                <span className="text-[9px] text-rose-500 font-bold uppercase tracking-tighter">
                                    ₹{deductions.toLocaleString()} DEDUCTED
                                </span>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Payroll Rev.",
            cell: ({ row }) => {
                const isGenerated = ['Generated', 'Approved', 'Paid', 'Closed'].includes(row.original.payrollStatus || '');
                const status = row.original.payrollStatus || "Draft";
                return (
                    <Badge variant={isGenerated ? "default" : "outline"} className={cn(
                        "uppercase font-black text-[9px] tracking-widest px-3",
                        isGenerated ? "bg-emerald-500 hover:bg-emerald-600 border-none" : "border-amber-500 text-amber-600 bg-amber-50"
                    )}>
                        {status}
                    </Badge>
                );
            },
        }
    ], [editingId, tempSalary]);

    const totals = useMemo(() => {
        return employees.reduce((acc, emp) => {
            const isGenerated = ['Generated', 'Approved', 'Paid', 'Closed'].includes(emp.payrollStatus || '');
            const calc = isGenerated ? emp.payrollData : emp.calculation;
            return {
                netPayable: acc.netPayable + (calc?.netPayable || 0),
                totalDeductions: acc.totalDeductions + (calc?.totalDeductions || 0),
                grossEarnings: acc.grossEarnings + (calc?.totalEarnings || 0),
                count: acc.count + 1
            };
        }, { netPayable: 0, totalDeductions: 0, grossEarnings: 0, count: 0 });
    }, [employees]);

    const averagePayout = totals.count > 0 ? totals.netPayable / totals.count : 0;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Step Wizard Header */}
            <div className="flex items-center justify-between bg-primary/5 p-4 rounded-3xl border border-primary/10">
                <div className="flex gap-8">
                    {steps.map((s) => (
                        <div key={s.id} className={cn(
                            "flex items-center gap-3 transition-opacity duration-500",
                            step === s.id ? "opacity-100" : "opacity-40"
                        )}>
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner",
                                step === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {s.id}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-[10px] uppercase font-black tracking-widest leading-none">{s.id < step ? "Completed" : "Step"}</p>
                                <p className="font-black text-xs uppercase italic">{s.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    {step > 1 && (
                        <Button variant="ghost" onClick={() => setStep((step - 1) as any)} className="rounded-xl h-10 px-4 font-bold border-2">
                            Back
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button onClick={() => setStep((step + 1) as any)} className="rounded-xl h-10 px-6 font-black uppercase tracking-tight shadow-md">
                            Continue to {steps[step].title}
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleGeneratePayroll}
                            disabled={generating}
                            className="rounded-xl h-10 px-6 font-black uppercase tracking-tight shadow-lg shadow-primary/20"
                        >
                            {generating ? "Processing..." : "Generate & Finalize"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic line-height-1">
                        Payroll Cycle <span className="text-primary">{format(new Date(year, month), "MMMM yyyy")}</span>
                    </h1>
                    <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">{steps[step-1].desc}</p>
                </div>
                <div className="flex items-center gap-4">
                    <select 
                        className="bg-muted px-4 py-2 rounded-xl font-bold text-sm border-none focus:ring-2 focus:ring-primary transition-all"
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                                {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2024, i))}
                            </option>
                        ))}
                    </select>
                    <select 
                        className="bg-muted px-4 py-2 rounded-xl font-bold text-sm border-none focus:ring-2 focus:ring-primary transition-all"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                    >
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <Button 
                        variant="outline"
                        onClick={async () => {
                            if (!confirm("Generate test attendance data for all employees for this month?")) return;
                            try {
                                const res = await fetch("/api/admin/seed/attendance", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ month, year })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    toast.success(data.message);
                                    fetchEmployees();
                                } else {
                                    toast.error(data.error);
                                }
                            } catch (e) {
                                toast.error("Seeding failed");
                            }
                        }}
                        className="rounded-xl h-10 px-4 font-bold border-2 border-amber-500/20 text-amber-600 hover:bg-amber-500/5"
                    >
                        <Calendar className="h-4 w-4 mr-2" /> Seed Attendance
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => router.push("/admin/payroll/templates")}
                        className="rounded-xl h-10 px-4 font-bold border-2"
                    >
                        <Settings className="h-4 w-4 mr-2" /> Templates
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : step === 1 ? (
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <StatsCard
                            title="Total Payout"
                            value={`₹ ${totals.netPayable.toLocaleString()}`}
                            description={`₹${totals.totalDeductions.toLocaleString()} total deductions`}
                            icon={Banknote}
                        />
                        <StatsCard
                            title="Avg. Payout"
                            value={`₹ ${Math.round(averagePayout).toLocaleString()}`}
                            description="Actual net average"
                            icon={Wallet}
                            className="bg-primary/5 border-primary/10"
                        />
                        <StatsCard
                            title="Headcount"
                            value={totals.count}
                            description="Employees processed"
                            icon={UsersIcon}
                        />
                    </div>
                    <div className="group">
                        <DataTable
                            columns={columns}
                            data={employees}
                            loading={loading}
                            searchKey="firstName"
                        />
                    </div>
                </div>
            ) : step === 2 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in slide-in-from-right-8 duration-500">
                    {employees.map((emp) => (
                        <Card key={emp._id} className="border-2 hover:border-primary/40 transition-all duration-300 rounded-3xl overflow-hidden shadow-lg hover:shadow-primary/5">
                            <CardHeader className="bg-primary/5 border-b pb-4">
                                <CardTitle className="text-lg font-black uppercase italic tracking-tight">{emp.firstName} {emp.lastName}</CardTitle>
                                <CardDescription className="font-bold text-[10px] uppercase text-primary/70">{emp.position}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    {(adjustments[emp._id] || []).map((adj, i) => (
                                        <div key={i} className="flex items-center justify-between bg-muted/30 p-3 rounded-2xl text-xs font-black border border-muted-foreground/5 group/adj">
                                            <div className="flex flex-col">
                                                <span className="uppercase tracking-tighter text-[9px] text-muted-foreground">{adj.type}</span>
                                                <span className="uppercase">{adj.label}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={adj.type === 'Deduction' ? "text-rose-500" : "text-emerald-500"}>
                                                    {adj.type === 'Deduction' ? '-' : '+'}₹{adj.amount.toLocaleString()}
                                                </span>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover/adj:opacity-100 transition-opacity" onClick={() => {
                                                    const newAdj = [...adjustments[emp._id]];
                                                    newAdj.splice(i, 1);
                                                    setAdjustments({ ...adjustments, [emp._id]: newAdj });
                                                }}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full h-11 rounded-xl text-[10px] uppercase font-black border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all mt-4"
                                        onClick={() => {
                                            const label = prompt("Adjustment Label? (e.g. Sales Bonus, Mobile Reimb.)");
                                            const amount = parseFloat(prompt("Amount?") || "0");
                                            const type = confirm("Is this a deduction? (Cancel for Bonus/Earning)") ? "Deduction" : "Bonus";
                                            if (label && !isNaN(amount)) {
                                                const current = adjustments[emp._id] || [];
                                                setAdjustments({ ...adjustments, [emp._id]: [...current, { label, amount, type }] });
                                            }
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Add Adjustment
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500 max-w-4xl mx-auto">
                    <div className="bg-primary/5 rounded-[3rem] p-16 border-4 border-dashed border-primary/20 text-center space-y-8 shadow-2xl">
                        <div className="h-32 w-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-background">
                            <Check className="h-16 w-16 text-primary animate-in zoom-in-50 duration-700" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-5xl font-black uppercase italic tracking-tighter">Everything looks good!</h3>
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Review final numbers before generating</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 py-8 border-y-2 border-primary/10 border-dashed">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Net Payable</p>
                                <p className="text-4xl font-black italic text-primary">₹{totals.netPayable.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Employees</p>
                                <p className="text-4xl font-black italic">{employees.length}</p>
                            </div>
                        </div>

                        <p className="max-w-md mx-auto text-muted-foreground font-medium text-sm">
                            Phase 3 will finalize these records, post the accounting entries, and release payslips to employee portals.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
