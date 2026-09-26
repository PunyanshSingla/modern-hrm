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
  ExternalLink
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
                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Management</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage your company departments and team leaders.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Add New Department</DialogTitle>
              <DialogDescription className="text-xs">
                Create a new department and set default leave allocations for its members.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-semibold">Department Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Engineering"
                  className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe the department's focus..."
                  className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {leaveTypes.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs font-semibold">Default Leave Balances (Days)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {leaveTypes.map((type) => (
                      <div key={type._id} className="p-2.5 rounded-lg border bg-muted/20 space-y-1">
                        <Label htmlFor={`leave-${type._id}`} className="text-[11px] font-medium text-muted-foreground">{type.name}</Label>
                        <Input
                          id={`leave-${type._id}`}
                          type="number"
                          min="0"
                          className="h-8 text-xs border-muted-foreground/60 focus:border-primary shadow-none bg-card"
                          value={getBalance(type._id) === 0 ? "" : getBalance(type._id)}
                          onChange={(e) => handleBalanceChange(type._id, e.target.value === "" ? 0 : parseInt(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full h-9 text-xs">Create Department</Button>
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
          loading={loading}
        />
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          description="Staff across all teams"
          icon={Users}
          loading={loading}
        />
        <StatsCard
          title="Average Team Size"
          value={stats.avgDeptSize}
          description="Employees per department"
          icon={Plus}
          loading={loading}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Department</DialogTitle>
            <DialogDescription className="text-xs">
              Update department details and default leave balances.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-xs font-semibold">Department Name</Label>
              <Input
                id="edit-name"
                className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-xs font-semibold">Description</Label>
              <Input
                id="edit-description"
                className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {leaveTypes.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-semibold">Default Leave Balances (Days)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {leaveTypes.map((type) => (
                    <div key={type._id} className="p-2.5 rounded-lg border bg-muted/20 space-y-1">
                      <Label htmlFor={`edit-leave-${type._id}`} className="text-[11px] font-medium text-muted-foreground">{type.name}</Label>
                      <Input
                        id={`edit-leave-${type._id}`}
                        type="number"
                        min="0"
                        className="h-8 text-xs border-muted-foreground/60 focus:border-primary shadow-none bg-card"
                        value={getBalance(type._id) === 0 ? "" : getBalance(type._id)}
                        onChange={(e) => handleBalanceChange(type._id, e.target.value === "" ? 0 : parseInt(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full h-9 text-xs">Update Department</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
