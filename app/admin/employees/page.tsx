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
  Users,
  UserCheck,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  View
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { ColumnDef } from "@tanstack/react-table";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  status: string;
  userId: {
    email: string;
    name: string;
  }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    position: ""
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/employees");
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee? This will remove their account.")) return;
    try {
      const res = await fetch(`/api/admin/employees/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchEmployees();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error deleting employee", error);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddOpen(false);
        setNewEmployee({ firstName: "", lastName: "", email: "", department: "", position: "" });
        fetchEmployees();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error adding employee", error);
    }
  };

  // Define Columns
  const columns = useMemo<ColumnDef<Employee>[]>(() => [
    {
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      id: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const isSorted = column.getIsSorted();
              if (isSorted === "asc") {
                column.toggleSorting(true); // desc
              } else if (isSorted === "desc") {
                column.clearSorting();
              } else {
                column.toggleSorting(false); // asc
              }
            }}
            className="hover:bg-transparent cursor-pointer"
          >
            Employee
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-medium uppercase border">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <div className="font-medium text-center">
                {employee.firstName} {employee.lastName}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "userId.email", // Access nested email property
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const isSorted = column.getIsSorted();
              if (isSorted === "asc") {
                column.toggleSorting(true);
              } else if (isSorted === "desc") {
                column.clearSorting();
              } else {
                column.toggleSorting(false);
              }
            }}
            className="hover:bg-transparent cursor-pointer"
          >
            Email
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const email = row.original.userId?.email || 'N/A';
        return <div className="text-sm text-muted-foreground">{email}</div>
      },
    },
    {
      accessorKey: "department",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const isSorted = column.getIsSorted();
              if (isSorted === "asc") {
                column.toggleSorting(true);
              } else if (isSorted === "desc") {
                column.clearSorting();
              } else {
                column.toggleSorting(false);
              }
            }}
            className="hover:bg-transparent cursor-pointer"
          >
            Department
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
    },
    {
      accessorKey: "position",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const isSorted = column.getIsSorted();
              if (isSorted === "asc") {
                column.toggleSorting(true);
              } else if (isSorted === "desc") {
                column.clearSorting();
              } else {
                column.toggleSorting(false);
              }
            }}
            className="hover:bg-transparent cursor-pointer"
          >
            Position
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant="secondary"
            className={status === 'verified'
              ? "bg-green-100 text-green-700 hover:bg-green-100/80 dark:bg-green-500/10 dark:text-green-400 border-transparent shadow-none"
              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 dark:bg-yellow-500/10 dark:text-yellow-400 border-transparent shadow-none"
            }
          >
            {(status || 'invited').charAt(0).toUpperCase() + (status || 'invited').slice(1)}
          </Badge>
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex items-center justify-center">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.location.href = `/admin/employees/${employee._id}`}>
              <View className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(employee._id)}>
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
            </Button>
          </div>
        )
      }
    }
  ], []);

  // Filter Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const searchString = searchTerm.toLowerCase();
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const email = (employee.userId?.email || "").toLowerCase();

      const matchesSearch = fullName.includes(searchString) || email.includes(searchString);
      const matchesStatus = statusFilter === "all"
        ? true
        : statusFilter === "verified"
          ? employee.status === "verified"
          : employee.status !== "verified";
      const matchesDepartment = departmentFilter === "all"
        ? true
        : employee.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, searchTerm, statusFilter, departmentFilter]);


  // Stats Logic
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'verified').length;
  const pendingEmployees = totalEmployees - activeEmployees;

  // Get unique departments
  const departments = Array.from(new Set(employees.map(e => e.department))).filter(Boolean);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your employees, onboard new hires, and track verification status.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Invite a new employee to the platform. They will receive an email to set up their account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Send Invite</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Employees"
          value={totalEmployees}
          description="All registered employees"
          icon={Users}
        />
        <StatsCard
          title="Active Members"
          value={activeEmployees}
          description="Verified accounts"
          icon={UserCheck}
        />
        <StatsCard
          title="Pending Invites"
          value={pendingEmployees}
          description="Awaiting verification"
          icon={UserPlus}
        />
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Employee Table */}
        <div className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading employees...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredEmployees}
            />
          )}
        </div>
      </div>
    </div>
  );
}
