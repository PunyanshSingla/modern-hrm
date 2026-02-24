"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Trash2,
  Building2,
  Users,
  Pencil,
  View
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { ColumnDef } from "@tanstack/react-table";
import Link from 'next/link';
import SearchInput from "@/components/SearchInput";

interface Department {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  employeeCount: number;
  leaveBalances?: {
    leaveTypeId: string;
    balance: number;
  }[];
}

interface LeaveType {
  _id: string;
  name: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalEmployees: 0,
    avgDeptSize: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    managerId: "",
    leaveBalances: [] as { leaveTypeId: string; balance: number }[]
  });

  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeaveTypes = async () => {
    try {
      const res = await fetch("/api/admin/leave-types");
      const data = await res.json();
      if (data.success) {
        setLeaveTypes(data.leaveTypes);
      }
    } catch (error) {
      console.error("Failed to fetch leave types", error);
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      if (data.success) {
        setDepartments(data.departments);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch departments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchLeaveTypes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      const res = await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchDepartments();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error deleting department", error);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddOpen(false);
        setFormData({ name: "", description: "", managerId: "", leaveBalances: [] });
        fetchDepartments();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error adding department", error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;
    try {
      const res = await fetch(`/api/admin/departments/${selectedDepartment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditOpen(false);
        setSelectedDepartment(null);
        setFormData({ name: "", description: "", managerId: "", leaveBalances: [] });
        fetchDepartments();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error updating department", error);
    }
  };

  const openEditDialog = (department: any) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
      managerId: department.managerId?._id || department.managerId || "",
      leaveBalances: department.leaveBalances || []
    });
    setIsEditOpen(true);
  };

  const handleBalanceChange = (leaveTypeId: string, balance: number) => {
    if (!leaveTypeId) return;
    setFormData(prev => {
      const currentBalances = prev.leaveBalances || [];
      const existing = currentBalances.find(b => 
        b.leaveTypeId?.toString() === leaveTypeId.toString()
      );
      
      if (existing) {
        return {
          ...prev,
          leaveBalances: currentBalances.map(b => 
            b.leaveTypeId?.toString() === leaveTypeId.toString() ? { ...b, balance } : b
          )
        };
      } else {
        return {
          ...prev,
          leaveBalances: [...currentBalances, { leaveTypeId, balance }]
        };
      }
    });
  };

  const getBalance = (leaveTypeId: string) => {
    if (!leaveTypeId) return 0;
    return formData.leaveBalances?.find(b => 
      b.leaveTypeId?.toString() === leaveTypeId.toString()
    )?.balance || 0;
  };

  // Define Columns
  const columns = useMemo<ColumnDef<Department>[]>(() => [
    {
      accessorKey: "name",
      header: "Department Name",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">{row.getValue("name")}</span>
      )
    },
    {
      accessorKey: "employeeCount",
      header: "Employees",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
           <div className="h-2 w-2 rounded-full bg-emerald-500" />
           <span className="font-mono font-bold text-sm">{row.getValue("employeeCount")} members</span>
        </div>
      )
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        return <div className="max-w-[300px] truncate text-muted-foreground" title={row.getValue("description")}>{row.getValue("description") || "-"}</div>
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        return <span className="text-muted-foreground text-xs font-medium italic">{new Date(row.getValue("createdAt")).toLocaleDateString()}</span>;
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const department = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Link href={`/admin/departments/${department._id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                <View className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-500/10" onClick={() => openEditDialog(department)}>
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10" onClick={() => handleDelete(department._id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )
      }
    }
  ], []);

  const filteredDepartments = useMemo(() => {
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Departments</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage your company departments and team leaders.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 px-6 rounded-2xl shadow-lg shadow-primary/20 font-bold transition-all hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5" /> Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto rounded-[32px] border-muted-foreground/10 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Add New Department</DialogTitle>
              <DialogDescription className="font-medium">
                Create a new department for your organization.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="grid gap-6 py-6">
              {/* Form fields... */}
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Department Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Engineering"
                  className="h-12 rounded-2xl bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/30"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe the department's focus..."
                  className="h-12 rounded-2xl bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/30"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Default Leave Balances (Days)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {leaveTypes.map((type) => (
                    <div key={type._id} className="grid gap-2">
                      <Label htmlFor={`leave-${type._id}`} className="text-[10px] font-bold uppercase text-muted-foreground">{type.name}</Label>
                      <Input
                        id={`leave-${type._id}`}
                        type="number"
                        min="0"
                        className="h-10 rounded-xl bg-muted/30 border-muted-foreground/10"
                        value={getBalance(type._id) === 0 ? "" : getBalance(type._id)}
                        onChange={(e) => handleBalanceChange(type._id, e.target.value === "" ? 0 : parseInt(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button type="submit" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">Create Department</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Departments"
          value={stats.totalDepartments}
          description="Active departments"
          icon={Building2}
        />
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          description="Staff across all teams"
          icon={Users}
        />
        <StatsCard
          title="Average Team Size"
          value={stats.avgDeptSize}
          description="Employees per department"
          icon={Plus}
        />
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredDepartments}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto rounded-[32px] border-muted-foreground/10 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Department</DialogTitle>
            <DialogDescription className="font-medium">
              Update department details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="edit-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Name</Label>
              <Input
                id="edit-name"
                className="h-12 rounded-2xl bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/30"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="edit-description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
              <Input
                id="edit-description"
                className="h-12 rounded-2xl bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/30"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Default Leave Balances (Days)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {leaveTypes.map((type) => (
                  <div key={type._id} className="grid gap-2">
                    <Label htmlFor={`edit-leave-${type._id}`} className="text-[10px] font-bold uppercase text-muted-foreground">{type.name}</Label>
                    <Input
                      id={`edit-leave-${type._id}`}
                      type="number"
                      min="0"
                      className="h-10 rounded-xl bg-muted/30 border-muted-foreground/10"
                      value={getBalance(type._id) === 0 ? "" : getBalance(type._id)}
                      onChange={(e) => handleBalanceChange(type._id, e.target.value === "" ? 0 : parseInt(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">Update Department</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
