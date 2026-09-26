"use client";

import { useEffect, useState, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Users, Briefcase, Clock, UserPlus, Trash2, ChevronsUpDown, X } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string; // from populated userId
  position: string;
  userId: {
    email: string;
    image?: string;
  }
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  departmentId?: { _id: string, name: string };
  teamMembers: Employee[];
  departmentMembers?: Employee[]; // Members from assigned department
  managerId?: { name: string, email: string, image?: string };
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Assignment State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
      } else {
        // router.push("/admin/projects");
      }
    } catch (error) {
      console.error("Failed to fetch project", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/admin/employees');
      const data = await res.json();
      if (data.success) {
        const currentTeamIds = new Set([
          ...(project?.teamMembers?.map(e => e._id) || []),
          ...(project?.departmentMembers?.map(e => e._id) || [])
        ]);

        let filtered = data.employees.filter((e: any) => !currentTeamIds.has(e._id));

        if (project?.departmentId?._id) {
          filtered = filtered.filter((e: any) => {
            if (!e.departmentId) return false;
            if (typeof e.departmentId === "string") return e.departmentId === project.departmentId!._id;
            return e.departmentId._id === project.departmentId!._id;
          });
        }

        setAvailableEmployees(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  }

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  useEffect(() => {
    if (isAssignOpen) {
      fetchEmployees();
      setSelectedEmployeeIds([]); // Reset selection on open
    }
  }, [isAssignOpen, project]);


  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || selectedEmployeeIds.length === 0) return;

    // Add to teamMembers list
    const newTeamMembers = [
      ...project.teamMembers.map(m => m._id),
      ...selectedEmployeeIds
    ];

    try {
      const res = await fetch(`/api/admin/projects/${project._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamMembers: newTeamMembers })
      });

      const data = await res.json();
      if (data.success) {
        setIsAssignOpen(false);
        setSelectedEmployeeIds([]);
        fetchProject();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to assign employee", error);
    }
  };

  const removeMember = async (employeeId: string) => {
    if (!confirm("Remove this member from the project team?")) return;
    if (!project) return;

    // Remove from teamMembers list
    const newTeamMembers = project.teamMembers.filter(m => m._id !== employeeId).map(m => m._id);

    try {
      const res = await fetch(`/api/admin/projects/${project._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamMembers: newTeamMembers })
      });

      const data = await res.json();
      if (data.success) {
        fetchProject();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to remove employee", error);
    }
  }

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  if (loading) return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-border/60 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded opacity-50" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl opacity-60" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl opacity-50" />
    </div>
  );
  if (!project) return <div>Project not found</div>;

  const employeeColumns: ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {row.original.firstName?.[0]}{row.original.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="">
            {row.original.userId?.email}
        </div>
      )
    },
    {
      accessorKey: "position",
      header: "Position",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isExplicit = project.teamMembers.some(m => m._id === row.original._id);

        if (!isExplicit) return <span className="text-xs text-muted-foreground italic">Dept. Member</span>;

        return (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeMember(row.original._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )
      }
    }
  ];

  const allMembers = [
    ...project.teamMembers,
    ...(project.departmentMembers || [])
  ];

  const daysLeft = differenceInDays(new Date(project.endDate), new Date());

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant={project.status === 'Active' ? 'default' : 'secondary'} className={
                project.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-100' :
                  project.status === 'Completed' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100' :
                    project.status === 'On Hold' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-100' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100'
              }>{project.status}</Badge>
            </div>
            <p className="text-muted-foreground mt-2 max-w-2xl font-medium">{project.description}</p>
          </div>
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserPlus className="h-4 w-4" /> Add Member</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Team Members</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAssignSubmit} className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Select Employees</Label>
                  <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={employeeSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedEmployeeIds.length > 0
                          ? `${selectedEmployeeIds.length} employees selected`
                          : "Select employees..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0">
                      <Command>
                        <CommandInput placeholder="Search employees..." />
                        <CommandList>
                          <CommandEmpty>
                            {project?.departmentId
                              ? "No employees found in this department."
                              : "No employee found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {availableEmployees.map((employee) => (
                              <CommandItem
                                key={employee._id}
                                value={employee.firstName + " " + employee.lastName}
                                onSelect={() => {
                                  toggleEmployeeSelection(employee._id);
                                }}
                                className="flex items-center gap-2.5 cursor-pointer py-2 text-xs"
                              >
                                <Checkbox
                                  checked={selectedEmployeeIds.includes(employee._id)}
                                  onCheckedChange={() => toggleEmployeeSelection(employee._id)}
                                  className="border-muted-foreground/60"
                                />
                                <span className="font-medium text-foreground">{employee.firstName} {employee.lastName} ({employee.position})</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Selected Badges */}
                  {selectedEmployeeIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 max-h-[100px] overflow-y-auto">
                      {selectedEmployeeIds.map(memberId => {
                        const emp = availableEmployees.find(e => e._id === memberId);
                        if (!emp) return null;
                        return (
                          <Badge key={memberId} variant="secondary" className="pl-2 pr-1 py-1">
                            {emp.firstName} {emp.lastName}
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              className="h-4 w-4 ml-1 hover:bg-transparent"
                              onClick={() => toggleEmployeeSelection(memberId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full">Add Selected to Team</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Team Size"
            value={allMembers.length}
            description="Employees assigned"
            icon={Users}
          />
          <StatsCard
            title="Timeline"
            value={daysLeft > 0 ? `${daysLeft} days` : "Ended"}
            description={`${format(new Date(project.startDate), "MMM d")} - ${format(new Date(project.endDate), "MMM d, yyyy")}`}
            icon={Calendar}
          />
          <StatsCard
            title="Department"
            value={project.departmentId?.name || "Global"}
            description="Primary department"
            icon={Briefcase}
          />
          <StatsCard
            title="Status"
            value={project.status}
            description="Current state"
            icon={Clock}
          />
        </div>
      </div>

      {/* Team Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Team Members</h2>
          <Badge variant="secondary" className="px-3 rounded-full">{allMembers.length} Total</Badge>
        </div>
        <DataTable 
          columns={employeeColumns} 
          data={allMembers} 
          loading={loading}
          searchKey="name" 
        />
      </div>
    </div>
  );
}
