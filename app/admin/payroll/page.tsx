"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Banknote,
    Edit,
    Check,
    X,
    Users as UsersIcon,
    Wallet,
    Settings,
    Plus,
    Calendar,
    TrendingUp,
    TrendingDown,
    Sparkles,
    ArrowLeft,
    ArrowRight
} from "lucide-react";

import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
    const [adjustmentEmpId, setAdjustmentEmpId] = useState<string>("");
    const [adjustmentLabel, setAdjustmentLabel] = useState("");
    const [adjustmentAmount, setAdjustmentAmount] = useState("");
    const [adjustmentType, setAdjustmentType] = useState<"Bonus" | "Deduction">("Bonus");

    const [isGenerateConfirmOpen, setIsGenerateConfirmOpen] = useState(false);

    const steps = [
        { id: 1, title: "Check Days Worked", desc: "Review working days" },
        { id: 2, title: "Bonuses & Deductions", lt: " ", desc: "Add extras or cuts" },
        { id: 3, title: "Finalize", desc: "Generate Pay" }
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
        setIsGenerateConfirmOpen(false);
        setGenerating(true);
        try {
            const res = await fetch("/api/admin/payroll/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month, year, adjustments })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Payroll generated for ${data.count} employees successfully!`);
                setAdjustments({});
                setStep(1);
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
            id: "firstName",
            accessorFn: (row) => `${row.firstName} ${row.lastName}`,
            header: "Employee",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-sm tracking-tight text-foreground">{row.original.firstName} {row.original.lastName}</span>
                    <span className="text-xs text-muted-foreground">{row.original.position || "Staff"}</span>
                </div>
            )
        },
        {
            accessorKey: "departmentId.name",
            header: "Department",
            cell: ({ row }) => row.original.departmentId?.name ? (
                <Badge variant="secondary" className="text-xs font-medium bg-muted/60 text-foreground border-border/50">
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
                                    className="h-8 w-24 rounded-lg font-medium text-xs"
                                    value={tempSalary}
                                    onChange={(e) => setTempSalary(e.target.value)}
                                    type="number"
                                />
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => handleUpdateSalary(row.original._id)}>
                                    <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600" onClick={() => setEditingId(null)}>
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <span className="font-mono font-medium text-xs text-foreground">
                                    ₹{row.original.baseSalary?.toLocaleString() || "0"}
                                </span>
                                <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                                    setEditingId(row.original._id);
                                    setTempSalary(row.original.baseSalary.toString());
                                }}>
                                    <Edit className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                </Button>
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "attendanceStats",
            header: "Days Breakdown",
            cell: ({ row }) => {
                const isGenerated = ['Generated', 'Approved', 'Paid', 'Closed'].includes(row.original.payrollStatus || '');
                const stats = isGenerated ? row.original.payrollData.attendanceSnapshot : row.original.attendanceStats;
                if (!stats) return "-";
                return (
                    <div className="flex flex-col gap-1 items-start">
                        <span className="font-semibold text-xs text-foreground">
                            {stats.paidDays} Paid <span className="text-muted-foreground font-normal">/ {stats.totalDays} Total</span>
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium px-1.5 py-0">
                                {stats.presentDays} Present
                            </Badge>
                            {stats.leaveDays > 0 && (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-medium px-1.5 py-0">
                                    {stats.leaveDays} Leave
                                </Badge>
                            )}
                            {stats.lopDays > 0 && (
                                <Badge variant="secondary" className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[11px] font-medium px-1.5 py-0">
                                    {stats.lopDays} LOP
                                </Badge>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "actualPayout",
            header: "Final Pay",
            cell: ({ row }) => {
                const isGenerated = ['Generated', 'Approved', 'Paid', 'Closed'].includes(row.original.payrollStatus || '');
                const calc = isGenerated ? row.original.payrollData : row.original.calculation;
                const payout = calc?.netPayable;
                const deductions = calc?.totalDeductions;

                return (
                    <div className="flex flex-col gap-0.5 items-start">
                        <Badge variant="outline" className={cn(
                            "font-mono font-semibold text-xs px-2.5 py-0.5 border",
                            isGenerated ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                        )}>
                            ₹{payout?.toLocaleString() || "0"}
                        </Badge>
                        {deductions > 0 && (
                            <span className="text-[11px] text-rose-500 font-medium">
                                ₹{deductions.toLocaleString()} deducted
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Processing",
            cell: ({ row }) => {
                const isGenerated = ['Generated', 'Approved', 'Paid', 'Closed'].includes(row.original.payrollStatus || '');
                const status = row.original.payrollStatus || "Draft";
                return (
                    <Badge variant="outline" className={cn(
                        "text-xs font-medium px-2.5 py-0.5 border capitalize",
                        isGenerated ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20"
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

    const adjustmentStats = useMemo(() => {
        let bonuses = 0;
        let deductions = 0;
        let modifiedCount = 0;

        Object.values(adjustments).forEach((adjList) => {
            if (adjList && adjList.length > 0) {
                modifiedCount++;
                adjList.forEach((a) => {
                    if (a.type === 'Bonus') bonuses += a.amount;
                    else if (a.type === 'Deduction') deductions += a.amount;
                });
            }
        });

        return { bonuses, deductions, modifiedCount };
    }, [adjustments]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Step Wizard Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card p-3 px-4 rounded-xl border shadow-xs gap-4">
                <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto overflow-x-auto">
                    {steps.map((s, index) => {
                        const isActive = step === s.id;
                        const isCompleted = step > s.id;
                        return (
                            <div key={s.id} className="flex items-center gap-3 shrink-0">
                                <div className={cn(
                                    "flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all",
                                    isActive ? "bg-primary/10 text-primary border border-primary/20" : isCompleted ? "text-foreground" : "text-muted-foreground opacity-60"
                                )}>
                                    <div className={cn(
                                        "h-6 w-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 transition-colors",
                                        isActive ? "bg-primary text-primary-foreground" : isCompleted ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                                    )}>
                                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.id}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-medium leading-none text-muted-foreground">{isCompleted ? "Completed" : `Step ${s.id}`}</p>
                                        <p className="text-xs font-semibold tracking-tight mt-0.5">{s.title}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="h-4 w-[1px] bg-border hidden sm:block" />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                    {step > 1 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStep((step - 1) as any)}
                            className="h-8 text-xs font-medium rounded-lg px-3"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button
                            size="sm"
                            onClick={() => setStep((step + 1) as any)}
                            className="h-8 text-xs font-medium rounded-lg px-4 gap-1.5 shadow-xs"
                        >
                            Continue {step === 1 ? "to Bonuses" : "to Finalize"} <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => setIsGenerateConfirmOpen(true)}
                            disabled={generating}
                            className="h-8 text-xs font-medium rounded-lg px-4 gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Check className="h-3.5 w-3.5" /> {generating ? "Processing..." : "Generate Payroll"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Salary for <span className="text-primary">{format(new Date(year, month), "MMMM yyyy")}</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1 font-normal">{steps[step - 1].desc}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                        <SelectTrigger className="w-[130px] h-8 border-border text-xs rounded-lg shadow-xs">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i} value={i.toString()} className="text-xs font-medium cursor-pointer">
                                    {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2024, i))}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                        <SelectTrigger className="w-[90px] h-8 border-border text-xs rounded-lg shadow-xs">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {[2024, 2025, 2026].map(y => (
                                <SelectItem key={y} value={y.toString()} className="text-xs font-medium cursor-pointer">
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/admin/payroll/templates")}
                        className="h-8 text-xs font-medium rounded-lg"
                    >
                        <Settings className="h-3.5 w-3.5 mr-1.5" /> Templates
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Skeleton className="h-28 rounded-2xl opacity-60" />
                        <Skeleton className="h-28 rounded-2xl opacity-60" />
                        <Skeleton className="h-28 rounded-2xl opacity-60" />
                    </div>
                    <Skeleton className="h-64 rounded-xl opacity-50" />
                </div>
            ) : step === 1 ? (
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <StatsCard
                            title="Total Salary Cost"
                            value={`₹ ${totals.netPayable.toLocaleString()}`}
                            description={`₹${totals.totalDeductions.toLocaleString()} total deductions`}
                            icon={Banknote}
                        />
                        <StatsCard
                            title="Average Salary"
                            value={`₹ ${Math.round(averagePayout).toLocaleString()}`}
                            description="Actual net average"
                            icon={Wallet}
                            className="bg-primary/5 border-primary/10"
                        />
                        <StatsCard
                            title="Total Employees"
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
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    {/* Step 2 Summary Bar */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <StatsCard
                            title="Total Extra Earnings / Bonuses"
                            value={`₹ ${adjustmentStats.bonuses.toLocaleString()}`}
                            description="Added to current pay run"
                            icon={TrendingUp}
                            className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
                        />
                        <StatsCard
                            title="Total Extra Deductions"
                            value={`₹ ${adjustmentStats.deductions.toLocaleString()}`}
                            description="Deducted from current pay run"
                            icon={TrendingDown}
                            className="border-rose-500/20 bg-rose-500/5 text-rose-600"
                        />
                        <StatsCard
                            title="Employees Adjusted"
                            value={adjustmentStats.modifiedCount}
                            description={`Out of ${employees.length} total employees`}
                            icon={Sparkles}
                        />
                    </div>

                    {/* Employee Cards Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {employees.map((emp) => {
                            const empAdjustments = adjustments[emp._id] || [];
                            const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();

                            return (
                                <Card key={emp._id} className="group hover:border-primary/40 transition-all duration-300 flex flex-col justify-between">
                                    <CardHeader className="pb-3 border-b bg-card">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">{initials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-base font-semibold tracking-tight">{emp.firstName} {emp.lastName}</CardTitle>
                                                    <CardDescription className="text-xs font-medium text-muted-foreground">{emp.position || "Employee"}</CardDescription>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="text-[10px] font-semibold">
                                                Base ₹{emp.baseSalary ? emp.baseSalary.toLocaleString() : "0"}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1">
                                                <span>Adjustments ({empAdjustments.length})</span>
                                            </div>

                                            {empAdjustments.length === 0 ? (
                                                <div className="py-4 text-center border border-dashed rounded-lg bg-muted/20">
                                                    <p className="text-xs text-muted-foreground font-medium">No bonuses or deductions added</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                                    {empAdjustments.map((adj, i) => (
                                                        <div key={i} className="flex items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border/50 hover:border-border transition-all">
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "text-[10px] px-1.5 py-0 font-semibold border-none",
                                                                        adj.type === "Deduction" ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                                                                    )}
                                                                >
                                                                    {adj.type}
                                                                </Badge>
                                                                <span className="text-xs font-medium truncate max-w-[110px]">{adj.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("text-xs font-semibold", adj.type === 'Deduction' ? "text-rose-600" : "text-emerald-600")}>
                                                                    {adj.type === 'Deduction' ? '-' : '+'}₹{adj.amount.toLocaleString()}
                                                                </span>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
                                                                    onClick={() => {
                                                                        const newAdj = [...empAdjustments];
                                                                        newAdj.splice(i, 1);
                                                                        setAdjustments({ ...adjustments, [emp._id]: newAdj });
                                                                    }}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full h-9 rounded-lg text-xs font-semibold border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-all"
                                            onClick={() => {
                                                setAdjustmentEmpId(emp._id);
                                                setAdjustmentLabel("");
                                                setAdjustmentAmount("");
                                                setAdjustmentType("Bonus");
                                                setIsAdjustmentOpen(true);
                                            }}
                                        >
                                            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Adjustment
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500 max-w-4xl mx-auto">
                    <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b pb-6 text-center">
                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold tracking-tight">Everything looks good!</CardTitle>
                            <CardDescription className="font-medium">Review final numbers before generating payroll</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8 py-6 border-y border-dashed">
                                <div className="space-y-1 text-center">
                                    <p className="text-xs font-semibold text-muted-foreground">Total Net Payable</p>
                                    <p className="text-3xl font-bold text-primary">₹{totals.netPayable.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-xs font-semibold text-muted-foreground">Employees</p>
                                    <p className="text-3xl font-bold">{employees.length}</p>
                                </div>
                            </div>
                            <p className="text-center text-muted-foreground text-sm">
                                This will finalize the pay run, save the records, and send pay slips to everyone.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Add Adjustment Dialog */}
            <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Add Adjustment</DialogTitle>
                        <DialogDescription className="text-xs">
                            Add a bonus or deduction for this employee.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="adj-label" className="text-xs font-semibold">Label</Label>
                            <Input
                                id="adj-label"
                                placeholder="e.g. Sales Bonus, Mobile Reimb."
                                className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                                value={adjustmentLabel}
                                onChange={(e) => setAdjustmentLabel(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="adj-type" className="text-xs font-semibold">Type</Label>
                            <Select value={adjustmentType} onValueChange={(v: "Bonus" | "Deduction") => setAdjustmentType(v)}>
                                <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bonus" className="text-xs font-medium cursor-pointer">Bonus / Earning</SelectItem>
                                    <SelectItem value="Deduction" className="text-xs font-medium cursor-pointer">Deduction</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="adj-amount" className="text-xs font-semibold">Amount (₹)</Label>
                            <Input
                                id="adj-amount"
                                type="number"
                                placeholder="e.g. 5000"
                                className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                                value={adjustmentAmount}
                                onChange={(e) => setAdjustmentAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button
                            className="w-full h-9 text-xs"
                            onClick={() => {
                                const amount = parseFloat(adjustmentAmount);
                                if (!adjustmentLabel.trim() || isNaN(amount) || amount <= 0) {
                                    toast.error("Please enter a valid label and amount");
                                    return;
                                }
                                const current = adjustments[adjustmentEmpId] || [];
                                setAdjustments({ ...adjustments, [adjustmentEmpId]: [...current, { label: adjustmentLabel, amount, type: adjustmentType }] });
                                setIsAdjustmentOpen(false);
                            }}
                        >
                            Add Adjustment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Generate Payroll AlertDialog */}
            <AlertDialog open={isGenerateConfirmOpen} onOpenChange={setIsGenerateConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Generate Payroll</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to generate payroll for {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(year, month))} {year}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleGeneratePayroll} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            Generate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </div>
    );
}
