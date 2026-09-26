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
  FolderKanban,
  Pencil,
  ExternalLink,
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  X
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Link from 'next/link';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import SearchInput from "@/components/SearchInput";

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  departmentId?: { _id: string, name: string };
  managerId?: { name: string };
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  departmentId?: { _id: string; name: string } | string;
  department?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Create / Edit Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planned",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    departmentId: "",
    teamMembers: [] as string[]
  });

  const [departments, setDepartments] = useState<{ _id: string, name: string }[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      if (data.success) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/admin/employees");
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchDepartments();
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchProjects();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error deleting project", error);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      alert("Please select start and end dates");
      return;
    }

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddOpen(false);
        setFormData({ name: "", description: "", status: "Planned", startDate: undefined, endDate: undefined, departmentId: "", teamMembers: [] });
        fetchProjects();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error adding project", error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/admin/projects/${selectedProject._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditOpen(false);
        setSelectedProject(null);
        setFormData({ name: "", description: "", status: "Planned", startDate: undefined, endDate: undefined, departmentId: "", teamMembers: [] });
        fetchProjects();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error updating project", error);
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      startDate: project.startDate ? new Date(project.startDate) : undefined,
      endDate: project.endDate ? new Date(project.endDate) : undefined,
      departmentId: project.departmentId ? project.departmentId._id : "",
      teamMembers: [] // We don't load team members here for simplicity in this view, strictly project details
    });
    setIsEditOpen(true);
  };

  // Define Columns
  const columns = useMemo<ColumnDef<Project>[]>(() => [
    {
      accessorKey: "name",
      header: "Project Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        if (status === 'Active') variant = "default";

        return (
          <Badge variant={variant} className={
            status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-100' :
              status === 'Completed' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100' :
                status === 'On Hold' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-100' :
                  'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100'
          }>
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: "departmentId.name",
      header: "Department",
      cell: ({ row }) => row.original.departmentId?.name || "Unassigned"
    },
    {
      accessorKey: "startDate",
      header: "Timeline",
      cell: ({ row }) => {
        const start = row.original.startDate ? format(new Date(row.original.startDate), "MMM d, yyyy") : "TBD";
        const end = row.original.endDate ? format(new Date(row.original.endDate), "MMM d, yyyy") : "TBD";
        return <div className="text-muted-foreground text-xs">{start} - {end}</div>
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Link href={`/admin/projects/${project._id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(project)}>
              <Pencil className="h-4 w-4 text-primary hover:text-primary/80" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(project._id)}>
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
            </Button>
          </div>
        )
      }
    }
  ], []);

  const filteredProjects = useMemo(() => {
    return projects.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const filteredEmployees = useMemo(() => {
    if (!formData.departmentId || formData.departmentId === "unassigned") {
      return employees;
    }
    return employees.filter(emp => {
      if (!emp.departmentId) return false;
      if (typeof emp.departmentId === "string") return emp.departmentId === formData.departmentId;
      return emp.departmentId._id === formData.departmentId;
    });
  }, [employees, formData.departmentId]);

  const toggleEmployee = (employeeId: string) => {
    setFormData(prev => {
      const current = prev.teamMembers;
      if (current.includes(employeeId)) {
        return { ...prev, teamMembers: current.filter(id => id !== employeeId) };
      } else {
        return { ...prev, teamMembers: [...current, employeeId] };
      }
    });
  };

  // Stats Logic
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalProjects = projects.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage and track projects across the company.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Create New Project</DialogTitle>
              <DialogDescription className="text-xs">
                Start a new project and assign it to a department or team members.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-semibold">Project Name</Label>
                <Input
                  id="name"
                  className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-semibold">Description (Optional)</Label>
                <Input
                  id="description"
                  className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-semibold">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none justify-start text-left font-normal rounded-lg",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border shadow-md" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => setFormData({ ...formData, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-semibold">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none justify-start text-left font-normal rounded-lg",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border shadow-md" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => setFormData({ ...formData, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status" className="text-xs font-semibold">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned" className="text-xs font-medium cursor-pointer">Planned</SelectItem>
                    <SelectItem value="Active" className="text-xs font-medium cursor-pointer">Active</SelectItem>
                    <SelectItem value="On Hold" className="text-xs font-medium cursor-pointer">On Hold</SelectItem>
                    <SelectItem value="Completed" className="text-xs font-medium cursor-pointer">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="department" className="text-xs font-semibold">Assign to Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value, teamMembers: [] })}
                >
                  <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                    <SelectValue placeholder="Select Department (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned" className="text-xs font-medium cursor-pointer">No specific department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id} className="text-xs font-medium cursor-pointer">{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Team Members</Label>
                <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={employeeSearchOpen}
                      className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none justify-between font-normal rounded-lg"
                    >
                      {formData.teamMembers.length > 0
                        ? `${formData.teamMembers.length} members selected`
                        : "Select team members..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-0 rounded-xl border shadow-md overflow-hidden">
                    <Command>
                      <CommandInput placeholder="Search employees..." />
                      <CommandList>
                        <CommandEmpty>
                          {formData.departmentId && formData.departmentId !== "unassigned"
                            ? "No employees found in this department."
                            : "No employee found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredEmployees.map((employee) => {
                            const isSelected = formData.teamMembers.includes(employee._id);
                            return (
                              <CommandItem
                                key={employee._id}
                                value={employee.firstName + " " + employee.lastName}
                                className="flex items-center gap-2.5 cursor-pointer py-2 text-xs"
                                onSelect={() => {
                                  toggleEmployee(employee._id);
                                }}
                              >
                                <Checkbox 
                                  checked={isSelected}
                                  onCheckedChange={() => toggleEmployee(employee._id)}
                                  className="border-muted-foreground/60"
                                />
                                <span className="font-medium text-foreground">{employee.firstName} {employee.lastName}</span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {formData.teamMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formData.teamMembers.map(memberId => {
                      const emp = employees.find(e => e._id === memberId);
                      if (!emp) return null;
                      return (
                        <Badge key={memberId} variant="secondary" className="pl-2.5 pr-1 py-0.5 text-xs rounded-md font-medium">
                          {emp.firstName} {emp.lastName}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-transparent rounded-full"
                            onClick={() => toggleEmployee(memberId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full h-9 text-xs">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Project</DialogTitle>
            <DialogDescription className="text-xs">
              Update project details, status, and department assignment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-xs font-semibold">Project Name</Label>
              <Input
                id="edit-name"
                className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-xs font-semibold">Description</Label>
              <Input
                id="edit-description"
                className="h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none justify-start text-left font-normal rounded-lg",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl border shadow-md" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "h-9 text-xs border-muted-foreground/60 focus:border-primary shadow-none justify-start text-left font-normal rounded-lg",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl border shadow-md" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-status" className="text-xs font-semibold">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned" className="text-xs font-medium cursor-pointer">Planned</SelectItem>
                  <SelectItem value="Active" className="text-xs font-medium cursor-pointer">Active</SelectItem>
                  <SelectItem value="On Hold" className="text-xs font-medium cursor-pointer">On Hold</SelectItem>
                  <SelectItem value="Completed" className="text-xs font-medium cursor-pointer">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-department" className="text-xs font-semibold">Assign to Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
              >
                <SelectTrigger className="w-full h-9 border-muted-foreground/60 focus:border-primary shadow-none text-xs rounded-lg">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" className="text-xs font-medium cursor-pointer">No specific department</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id} className="text-xs font-medium cursor-pointer">{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full h-9 text-xs">Update Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Projects"
          value={totalProjects}
          description="All projects"
          icon={FolderKanban}
          loading={loading}
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects}
          description="Projects in progress"
          icon={FolderKanban}
          loading={loading}
        />
        <StatsCard
          title="Completed"
          value={completedProjects}
          description="Finished projects"
          icon={FolderKanban}
          loading={loading}
        />
      </div>

      {/* Main Content Area */}
      <div className="overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredProjects}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
          />
        </div>
      </div>
  );
}
