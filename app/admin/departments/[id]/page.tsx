"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Users,
  UserPlus,
  ExternalLink,
  Trash2
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  position: string;
  status: string;
  departmentId?: string;
  userId: {
    email: string;
    name: string;
    image?: string;
  }
}

interface Department {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  employeeCount: number;
  employees: Employee[];
}

export default function DepartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Assign Employee State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchDepartment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/departments/${id}`);
      const data = await res.json();
      if (data.success) {
        setDepartment(data.department);
      } else {
         // Handle error, maybe redirect
         console.error(data.error);
      }
    } catch (error) {
      console.error("Failed to fetch department", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmployees = async () => {
      try {
          const res = await fetch("/api/admin/employees");
          const data = await res.json();
          if (data.success) {
              setAllEmployees(data.employees);
          }
      } catch (error) {
          console.error("Failed to fetch all employees", error);
      }
  };

  useEffect(() => {
    if (id) {
      fetchDepartment();
    }
  }, [id]);

  useEffect(() => {
      if (isAssignOpen) {
          fetchAllEmployees();
      }
  }, [isAssignOpen]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedEmployeeId) return;
      
      setAssignLoading(true);
      try {
          // Identify the employee object to update department name locally as well if possible, or fully rely on department update
          // We need to update the employee's departmentId. 
          // Note: The backend logic for GET department/:id fetches employees by departmentId.
          // So satisfying that requirement requires updating the employee's departmentId.
          
          const res = await fetch(`/api/admin/employees/${selectedEmployeeId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  departmentId: id,
                  department: department?.name // Sync string field for now if it's still used
              })
          });
          
          const data = await res.json();
          if (data.success) {
              setIsAssignOpen(false);
              setSelectedEmployeeId("");
              fetchDepartment(); // Refresh list
          } else {
              alert(data.error);
          }
      } catch (error) {
          console.error("Error assigning employee", error);
      } finally {
          setAssignLoading(false);
      }
  }
  
  const handleRemoveEmployee = async (employeeId: string) => {
      if (!confirm("Are you sure you want to remove this employee from this department?")) return;
      try {
          const res = await fetch(`/api/admin/employees/${employeeId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  departmentId: null, // Or unset
                  department: "" 
              })
          });
          const data = await res.json();
          if (data.success) {
              fetchDepartment();
          } else {
              alert(data.error);
          }
      } catch (error) {
           console.error("Error removing employee", error);
      }
  }

  // Define Columns
  const columns = useMemo<ColumnDef<Employee>[]>(() => [
    {
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      id: "name",
      header: "Employee",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-medium uppercase border" title={`${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown'}>
              {employee.firstName?.[0]?.toUpperCase() || ''}{employee.lastName?.[0]?.toUpperCase() || (!employee.firstName?.[0] ? '?' : '')}
            </div>
            <div>
              <div className="font-medium">
                {employee.firstName} {employee.lastName}
              </div>
              <div className="text-xs text-muted-foreground">{employee.userId?.email}</div>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "position",
      header: "Position",
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
          <div className="flex items-center justify-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.location.href = `/admin/employees/${employee._id}`}>
              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveEmployee(employee._id)} title="Remove from Department">
               <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
            </Button>
          </div>
        )
      }
    }
  ], []);

  // Filter employees available to assign (only show those not currently assigned to any department)
  const availableEmployees = useMemo(() => {
      return allEmployees.filter(e => !e.departmentId);
  }, [allEmployees]);

  if (loading) {
      return <div className="p-8 text-center text-muted-foreground">Loading department details...</div>;
  }

  if (!department) {
      return <div className="p-8 text-center text-muted-foreground font-medium">Department not found.</div>;
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-4">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back to Departments
          </Button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{department.name}</h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">
                {department.description || "No description provided."}
              </p>
            </div>
            
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2 h-9 text-xs">
                        <UserPlus className="h-4 w-4" /> Assign Employee
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Assign Employee to {department.name}</DialogTitle>
                        <DialogDescription className="text-xs">
                            Select an employee to assign to this department.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAssignSubmit} className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="employee" className="text-xs font-semibold">Employee</Label>
                            <Select
                                value={selectedEmployeeId}
                                onValueChange={(val) => setSelectedEmployeeId(val)}
                            >
                                <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableEmployees.map(emp => (
                                        <SelectItem key={emp._id} value={emp._id} className="text-xs font-medium cursor-pointer">
                                            {emp.firstName} {emp.lastName} ({emp.userId?.email || emp.position})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {availableEmployees.length === 0 && (
                                <p className="text-xs text-amber-600 font-medium">No unassigned employees available.</p>
                            )}
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="submit" className="w-full h-9 text-xs" disabled={assignLoading || availableEmployees.length === 0}>
                                {assignLoading ? "Assigning..." : "Assign User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
          </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Employees"
          value={department.employeeCount}
          description="In this department"
          icon={Users}
        />
        {/* Placeholder for future stats */}
      </div>

      {/* Employees Table */}
      <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-1000">
         <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold tracking-tight text-foreground/90 uppercase">Department Members</h2>
           <Badge variant="secondary" className="px-3 rounded-full">{department.employees.length} Active Members</Badge>
         </div>
         <div className="p-0">
             <DataTable
                 columns={columns}
                 data={department.employees}
                 loading={loading}
                 searchKey="name"
             />
         </div>
      </div>
    </div>
  );
}
