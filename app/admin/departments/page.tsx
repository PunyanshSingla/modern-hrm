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
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      if (data.success) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Failed to fetch departments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
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
        setFormData({ name: "", description: "" });
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
        setFormData({ name: "", description: "" });
        fetchDepartments();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error updating department", error);
    }
  };

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || ""
    });
    setIsEditOpen(true);
  };

  // Define Columns
  const columns = useMemo<ColumnDef<Department>[]>(() => [
    {
      accessorKey: "name",
      header: "Department Name",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        return <div className="max-w-[300px] truncate" title={row.getValue("description")}>{row.getValue("description") || "-"}</div>
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleDateString();
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <View className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(department)}>
              <Pencil className="h-4 w-4 text-primary hover:text-primary/80" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(department._id)}>
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
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

  // Stats Logic
  const totalDepartments = departments.length;
  // We can calculate more stats if needed, or placeholders for now

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Departments</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage your organization's core structure and unit leadership.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 px-6 rounded-2xl shadow-lg shadow-primary/20 font-bold transition-all hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5" /> Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[32px] border-muted-foreground/10 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Add New Department</DialogTitle>
              <DialogDescription className="font-medium">
                Create a new department for your organization.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="grid gap-6 py-6">
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Department Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Engineering"
                  className="h-12 rounded-2xl bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/30"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
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
          value={totalDepartments}
          description="Active organizational units"
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Avg. Team Size"
          value="14"
          description="Members per unit"
          icon={Users}
        />
        <StatsCard
          title="Unit Velocity"
          value="94%"
          description="Performance health"
          icon={View}
          trend={{ value: 5, isPositive: true }}
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
        <DialogContent className="sm:max-w-[425px] rounded-[32px] border-muted-foreground/10 bg-card/95 backdrop-blur-xl">
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="edit-description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
              <Input
                id="edit-description"
                className="h-12 rounded-2xl bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/30"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
