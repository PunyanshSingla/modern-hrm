"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Mail, 
    Phone, 
    MapPin, 
    Briefcase, 
    GraduationCap, 
    FileText, 
    Calendar,
    Building,
    CreditCard,
    Download,
    ExternalLink,
    Code,
    AlertTriangle,
    Ban
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/document-preview";
import { TechIcon } from "@/components/ui/tech-icon";
import { technologies } from "@/lib/technologies";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EmployeeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    
    const [employee, setEmployee] = useState<any>(null);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [itRequests, setItRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await fetch(`/api/admin/employees/${id}`);
                const data = await res.json();
                if (data.success) {
                    setEmployee(data.profile || data.employee);
                    setLeaves(data.leaves || []);
                    setItRequests(data.itRequests || []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchEmployee();
    }, [id]);

    const handleVerify = async () => {
        if (!confirm("Verify this employee?")) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/employees/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "verified" })
            });
            const data = await res.json();
            if (data.success) {
                setEmployee(data.profile);
                alert("Employee Verified!");
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/employees/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "rejected" })
            });
            const data = await res.json();
            if (data.success) {
                setEmployee(data.profile);
                alert("Employee Rejected/Disabled.");
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            return format(new Date(dateString), "MMM yyyy");
        } catch {
            return dateString;
        }
    };

    const getFileIcon = (url: string) => {
        if (!url) return <FileText className="h-5 w-5" />;
        const ext = url.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
        if (['jpg', 'jpeg', 'png'].includes(ext || '')) return <FileText className="h-5 w-5 text-blue-500" />;
        return <FileText className="h-5 w-5" />;
    };

    const getTechData = (techName: string) => {
        return technologies.find(t => t.name === techName);
    };

    if (loading) {
        return (
        <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading employee details...</p>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
        <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Employee Not Found</h2>
                    <p className="text-muted-foreground mb-4">The employee you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push('/admin/employees')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Employees
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => router.push('/admin/employees')}
                        className="h-9 w-9 rounded-lg shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {employee.firstName} {employee.lastName}
                            </h1>
                            <Badge 
                                variant={employee.status === 'verified' ? 'default' : 'secondary'} 
                                className="text-xs px-2.5 py-0.5"
                            >
                                {employee.status === 'verified' ? (
                                    <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Verified</span>
                                ) : (
                                    'Pending Verification'
                                )}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 font-medium flex-wrap">
                            <span className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5" />
                                {employee.position || "Employee"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Building className="h-3.5 w-3.5" />
                                {employee.department || "General"}
                            </span>
                            {employee.userId?.email && (
                                <span className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" />
                                    {employee.userId.email}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {employee.status !== 'verified' && (
                        <Button onClick={handleVerify} disabled={actionLoading} className="gap-2 h-9">
                            <CheckCircle className="h-4 w-4" /> Verify Employee
                        </Button>
                    )}
                    {employee.status !== 'rejected' && (
                        <Button variant="outline" onClick={handleReject} disabled={actionLoading} className="gap-2 h-9 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                            <Ban className="h-4 w-4" /> Disable Account
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted/60 p-1 text-muted-foreground w-fit gap-1 border border-border/50">
                    <TabsTrigger value="overview" className="rounded-md text-xs px-3 py-1 font-medium transition-all">Overview</TabsTrigger>
                    <TabsTrigger value="salary" className="rounded-md text-xs px-3 py-1 font-medium transition-all">Salary</TabsTrigger>
                    <TabsTrigger value="leaves-balances" className="rounded-md text-xs px-3 py-1 font-medium transition-all">Leave Balances</TabsTrigger>
                    <TabsTrigger value="leaves" className="rounded-md text-xs px-3 py-1 font-medium transition-all">Leave History</TabsTrigger>
                    <TabsTrigger value="it-requests" className="rounded-md text-xs px-3 py-1 font-medium transition-all">IT Requests</TabsTrigger>
                </TabsList>
                    
                    <TabsContent value="salary" className="mt-3.5">
                        <SalaryTab 
                            employee={employee} 
                            onUpdate={(updated: any) => setEmployee(updated)} 
                        />
                    </TabsContent>

                    <TabsContent value="leaves-balances" className="mt-3.5">
                        <LeaveBalancesTab 
                            employee={employee} 
                            onUpdate={(updated: any) => setEmployee(updated)} 
                        />
                    </TabsContent>

                    <TabsContent value="overview" className="mt-3.5">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                                {/* Left Main Column */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Contact Information */}
                                    <Card className="rounded-xl border border-border/60 shadow-xs">
                                        <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                Contact Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                                                </span>
                                                <p className="text-sm font-semibold truncate">{employee.userId?.email || employee.email || "N/A"}</p>
                                            </div>
                                            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number
                                                </span>
                                                <p className="text-sm font-semibold">{employee.phone || "Not provided"}</p>
                                            </div>
                                            <div className="p-3 rounded-lg border bg-muted/20 space-y-1 md:col-span-2">
                                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-primary" /> Residential Address
                                                </span>
                                                <p className="text-sm font-semibold">{employee.address || "Not provided"}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Work Experience */}
                                    {employee.experience && employee.experience.length > 0 && (
                                        <Card className="rounded-xl border border-border/60 shadow-xs">
                                            <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                                                        <Briefcase className="h-4 w-4" />
                                                    </div>
                                                    Work Experience
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 sm:p-5 space-y-4">
                                                {employee.experience.map((exp: any, i: number) => (
                                                    <div key={i} className="p-4 rounded-xl border bg-card/60 shadow-2xs hover:border-primary/30 transition-all space-y-3">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <h3 className="font-bold text-base capitalize">{exp.role || "Role not specified"}</h3>
                                                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5 capitalize">
                                                                    <Building className="h-3.5 w-3.5 text-primary" />
                                                                    {exp.company || "Company not specified"}
                                                                </p>
                                                            </div>
                                                            {exp.employmentType && (
                                                                <Badge variant="outline" className="text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize bg-muted/40">
                                                                    {exp.employmentType}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {(exp.startDate || exp.endDate) && (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span>{formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : "Present"}</span>
                                                            </div>
                                                        )}

                                                        {exp.reasonForLeaving && (
                                                            <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">
                                                                <span className="font-semibold text-foreground">Reason for leaving:</span> {exp.reasonForLeaving}
                                                            </p>
                                                        )}

                                                        {exp.technologies && exp.technologies.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                                {exp.technologies.map((techName: string, idx: number) => {
                                                                    const techData = getTechData(techName);
                                                                    return (
                                                                        <Badge key={idx} variant="secondary" className="pl-2 pr-2 py-1 text-xs rounded-md border font-medium flex items-center gap-1.5">
                                                                            <TechIcon tech={techData} size={14} />
                                                                            {techName}
                                                                        </Badge>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Education */}
                                    {employee.education && employee.education.length > 0 && (
                                        <Card className="rounded-xl border border-border/60 shadow-xs">
                                            <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                                                        <GraduationCap className="h-4 w-4" />
                                                    </div>
                                                    Education
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 sm:p-5 space-y-4">
                                                {employee.education.map((edu: any, i: number) => (
                                                    <div key={i} className="p-4 rounded-xl border bg-card/60 shadow-2xs hover:border-amber-500/30 transition-all space-y-2">
                                                        <h3 className="font-bold text-base">{edu.degree || "Degree not specified"}</h3>
                                                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                                            <Building className="h-3.5 w-3.5 text-amber-500" />
                                                            {edu.institution || "Institution not specified"}
                                                        </p>
                                                        {(edu.startDate || edu.endDate) && (
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Certifications */}
                                    {employee.certifications && employee.certifications.length > 0 && (
                                        <Card className="rounded-xl border border-border/60 shadow-xs">
                                            <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    Certifications
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 sm:p-5 space-y-4">
                                                {employee.certifications.map((cert: any, i: number) => (
                                                    <div key={i} className="p-4 rounded-xl border bg-card/60 shadow-2xs hover:border-purple-500/30 transition-all flex items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <h3 className="font-bold text-base">{cert.name || "Certification"}</h3>
                                                            <p className="text-xs text-muted-foreground font-medium">{cert.issuer || "Issuer not specified"}</p>
                                                            {cert.date && (
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                                                                    <Calendar className="h-3.5 w-3.5" />
                                                                    {formatDate(cert.date)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {cert.url ? (
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                className="text-xs gap-1.5 h-8 rounded-lg"
                                                                onClick={() => setPreviewDoc({ url: cert.url, name: cert.name || `Certification ${i+1}` })}
                                                            >
                                                                <FileText className="h-3 w-3 mr-1" />
                                                                Preview
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">No document</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                {/* Right Sidebar Column */}
                                <div className="space-y-6">
                                    {/* Bank Details */}
                                    {employee.bankDetails && (employee.bankDetails.accountHolderName || employee.bankDetails.accountNumber) && (
                                        <Card className="rounded-xl border border-border/60 shadow-xs">
                                            <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                                                        <CreditCard className="h-4 w-4" />
                                                    </div>
                                                    Bank Account
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 sm:p-5 space-y-3">
                                                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground">Account Holder</span>
                                                    <p className="text-sm font-semibold truncate">{employee.bankDetails.accountHolderName || "N/A"}</p>
                                                </div>
                                                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground">Bank Name</span>
                                                    <p className="text-sm font-semibold">{employee.bankDetails.bankName || "N/A"}</p>
                                                </div>
                                                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground">Account Number</span>
                                                    <p className="text-sm font-mono font-semibold">{employee.bankDetails.accountNumber || "N/A"}</p>
                                                </div>
                                                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground">IFSC Code</span>
                                                    <p className="text-sm font-mono font-semibold">{employee.bankDetails.ifscCode || "N/A"}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Technical Skills */}
                                    {employee.skills && employee.skills.length > 0 && (
                                        <Card className="rounded-xl border border-border/60 shadow-xs">
                                            <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                                                        <Code className="h-4 w-4" />
                                                    </div>
                                                    Technical Skills
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 sm:p-5">
                                                <div className="flex flex-wrap gap-2">
                                                    {employee.skills.map((skill: string, i: number) => {
                                                        const techData = getTechData(skill);
                                                        return (
                                                            <Badge key={i} variant="secondary" className="pl-2.5 pr-3 py-1.5 text-xs rounded-lg border font-medium flex items-center gap-2 shadow-2xs">
                                                                <TechIcon tech={techData} size={15} />
                                                                {skill}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Sidebar actions & documents */}
                                    <ActionsSidebar 
                                        employee={employee} 
                                        handleVerify={handleVerify} 
                                        handleReject={handleReject} 
                                        actionLoading={actionLoading} 
                                        getFileIcon={getFileIcon} 
                                        setPreviewDoc={setPreviewDoc} 
                                        formatDate={formatDate}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="leaves" className="mt-3.5">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Leave History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(!leaves || leaves.length === 0) ? (
                                        <div className="text-center py-8 text-muted-foreground">No leave history found.</div>
                                    ) : (
                                        <div className="rounded-md border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr className="border-b">
                                                        <th className="h-12 px-4 text-left font-medium">Type</th>
                                                        <th className="h-12 px-4 text-left font-medium">Dates</th>
                                                        <th className="h-12 px-4 text-left font-medium">Duration</th>
                                                        <th className="h-12 px-4 text-left font-medium">Reason</th>
                                                        <th className="h-12 px-4 text-left font-medium">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                     {leaves.map((leave: any) => {
                                                         const start = new Date(leave.startDate);
                                                         const end = new Date(leave.endDate);
                                                         const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                                         
                                                         return (
                                                            <tr key={leave._id} className="border-b last:border-0 hover:bg-muted/50">
                                                                <td className="p-4 font-medium">{leave.leaveTypeId?.name || leave.leaveType || "N/A"}</td>
                                                                <td className="p-4">
                                                                    {format(start, "MMM d, yyyy")} - {format(end, "MMM d, yyyy")}
                                                                </td>
                                                                <td className="p-4">{duration} days</td>
                                                                <td className="p-4 max-w-[200px] truncate" title={leave.reason}>{leave.reason}</td>
                                                                <td className="p-4">
                                                                    <Badge className={
                                                                        leave.status === 'Approved' ? "bg-green-500" :
                                                                        leave.status === 'Rejected' ? "bg-red-500" :
                                                                        "bg-yellow-500"
                                                                    }>
                                                                        {leave.status}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                         );
                                                     })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="it-requests" className="mt-3.5">
                            <Card>
                                <CardHeader>
                                    <CardTitle>IT Request History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(!itRequests || itRequests.length === 0) ? (
                                        <div className="text-center py-8 text-muted-foreground">No IT requests found.</div>
                                    ) : (
                                        <div className="rounded-md border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr className="border-b">
                                                        <th className="h-12 px-4 text-left font-medium">Item</th>
                                                        <th className="h-12 px-4 text-left font-medium">Type</th>
                                                        <th className="h-12 px-4 text-left font-medium">Date</th>
                                                        <th className="h-12 px-4 text-left font-medium">Priority</th>
                                                        <th className="h-12 px-4 text-left font-medium">Reason</th>
                                                        <th className="h-12 px-4 text-left font-medium">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {itRequests.map((req: any) => (
                                                        <tr key={req._id} className="border-b last:border-0 hover:bg-muted/50">
                                                            <td className="p-4 font-medium">{req.item}</td>
                                                            <td className="p-4">
                                                                <Badge variant="outline">{req.type}</Badge>
                                                            </td>
                                                            <td className="p-4">{format(new Date(req.requestDate), "MMM d, yyyy")}</td>
                                                            <td className="p-4">
                                                                <Badge variant="secondary" className={
                                                                    req.priority === 'High' ? "bg-red-100 text-red-800" :
                                                                    req.priority === 'Medium' ? "bg-yellow-100 text-yellow-800" :
                                                                    "bg-blue-100 text-blue-800"
                                                                }>
                                                                    {req.priority}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                                                            <td className="p-4">
                                                                <Badge className={
                                                                    req.status === 'Approved' ? "bg-green-500" :
                                                                    req.status === 'Rejected' ? "bg-red-500" :
                                                                    "bg-blue-500"
                                                                }>
                                                                    {req.status}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    {/* Document Preview Modal */}
                    {previewDoc && (
                        <DocumentPreview
                            url={previewDoc.url}
                            name={previewDoc.name}
                            isOpen={!!previewDoc}
                            onClose={() => setPreviewDoc(null)}
                        />
                    )}
                </Tabs>
        </div>
    );
}

function ActionsSidebar({ 
    employee, 
    handleVerify, 
    handleReject, 
    actionLoading, 
    getFileIcon, 
    setPreviewDoc, 
    formatDate 
}: any) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {employee.status !== 'verified' && (
                        <Button 
                            className="w-full bg-green-600 hover:bg-green-700" 
                            onClick={handleVerify}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Processing..." : (
                                <><CheckCircle className="h-4 w-4 mr-2" /> Verify Employee</>
                            )}
                        </Button>
                    )}
                    
                    {employee.status !== 'rejected' && (
                        <Button 
                            variant="destructive" 
                            className="w-full" 
                            onClick={handleReject}
                            disabled={actionLoading}
                        >
                             {actionLoading ? "Processing..." : (
                                <><Ban className="h-4 w-4 mr-2" /> Reject / Disable</>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Documents Card */}
             {employee.documents && employee.documents.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {employee.documents.map((doc: any, i: number) => (
                             <div key={i} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {getFileIcon(doc.url)}
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium truncate" title={doc.name}>{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">{doc.documentType || "Document"}</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => setPreviewDoc({ url: doc.url, name: doc.name })}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}function SalaryTab({ employee, onUpdate }: { employee: any, onUpdate: (updated: any) => void }) {
    const [structures, setStructures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedId, setSelectedId] = useState(employee.salaryStructureId?._id || employee.salaryStructureId || "");

    useEffect(() => {
        const fetchStructures = async () => {
            try {
                const res = await fetch("/api/admin/salary-structures");
                const data = await res.json();
                if (data.success) setStructures(data.structures);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStructures();
    }, []);

    const handleAssign = async () => {
        setSaving(true);
        try {
            const structure = structures.find(s => s._id === selectedId);
            const res = await fetch(`/api/admin/employees/${employee._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    salaryStructureId: selectedId || null,
                    baseSalary: structure ? structure.ctcAnnual / 12 : employee.baseSalary
                })
            });
            const data = await res.json();
            if (data.success) {
                onUpdate(data.profile);
                toast.success("Salary structure assigned!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to assign structure");
        } finally {
            setSaving(false);
        }
    };

    const currentStructure = structures.find(s => s._id === selectedId);

    if (loading) return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse font-medium">Loading salary structures...</div>;

    return (
        <Card className="rounded-xl border border-border/60 shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            Salary Configuration
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Assign an active salary structure template to this employee.
                        </CardDescription>
                    </div>
                    <Button onClick={handleAssign} disabled={saving || !selectedId} className="gap-2 h-9 text-xs">
                        {saving ? "Saving..." : "Assign Structure"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-6">
                <div className="max-w-md space-y-2">
                    <label className="text-xs font-semibold text-foreground">Salary Structure Template</label>
                    <Select
                        value={selectedId || "none"}
                        onValueChange={(val) => setSelectedId(val === "none" ? "" : val)}
                    >
                        <SelectTrigger className="w-full h-9 border-muted-foreground/30 focus:border-primary shadow-none text-xs rounded-lg">
                            <SelectValue placeholder="No Structure Assigned" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none" className="text-xs font-medium cursor-pointer">
                                No Structure Assigned
                            </SelectItem>
                            {structures.map((s) => (
                                <SelectItem key={s._id} value={s._id} className="text-xs font-medium cursor-pointer">
                                    {s.name} — ₹{(s.ctcAnnual/12).toLocaleString()}/mo
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {currentStructure && (
                    <div className="space-y-4 pt-2 border-t">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Structure Breakdown</h3>
                            <Badge variant="outline" className="text-[11px] font-medium">
                                Template Preview
                            </Badge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            {currentStructure.components.map((c: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-muted/20 text-xs">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">{c.type}</span>
                                        <span className="font-semibold text-foreground">{c.label}</span>
                                    </div>
                                    <span className="font-bold text-primary">
                                        {c.valueType === 'Percentage' ? `${c.value}% of Base` : `₹${c.value.toLocaleString()}`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border bg-emerald-500/5 p-4 border-emerald-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <h4 className="font-bold text-sm text-foreground">Estimated Monthly Gross</h4>
                                <p className="text-xs text-muted-foreground">Based on template annual CTC of ₹{currentStructure.ctcAnnual.toLocaleString()}</p>
                            </div>
                            <div className="text-2xl font-bold text-emerald-600">
                                ₹{Math.round(currentStructure.ctcAnnual / 12).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function LeaveBalancesTab({ employee, onUpdate }: { employee: any, onUpdate: (updated: any) => void }) {
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [balances, setBalances] = useState<any[]>(employee.leaveBalances || []);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const res = await fetch("/api/admin/leave-types");
                const data = await res.json();
                if (data.success) setLeaveTypes(data.leaveTypes);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaveTypes();
    }, []);

    const handleUpdateBalances = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/employees/${employee._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leaveBalances: balances })
            });
            const data = await res.json();
            if (data.success) {
                onUpdate(data.profile);
                toast.success("Leave balances updated!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update balances");
        } finally {
            setSaving(false);
        }
    };

    const handleBalanceChange = (leaveTypeId: string, balance: number) => {
        setBalances(prev => {
            const existing = prev.find((b: any) => (b.leaveTypeId._id || b.leaveTypeId) === leaveTypeId);
            if (existing) {
                return prev.map((b: any) => 
                    (b.leaveTypeId._id || b.leaveTypeId) === leaveTypeId ? { ...b, balance } : b
                );
            } else {
                return [...prev, { leaveTypeId, balance }];
            }
        });
    };

    const getBalance = (leaveTypeId: string) => {
        const entry = balances.find((b: any) => (b.leaveTypeId._id || b.leaveTypeId) === leaveTypeId);
        return entry?.balance ?? 0;
    };

    if (loading) return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse font-medium">Loading leave types...</div>;

    return (
        <Card className="rounded-xl border border-border/60 shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                                <Calendar className="h-4 w-4" />
                            </div>
                            Leave Balances Configuration
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 flex items-center gap-2">
                            Manage individual leave balances for this employee.
                            {employee.isLeaveBalanceOverridden && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] border-amber-200">Manual Override Active</Badge>
                            )}
                        </CardDescription>
                    </div>
                    <Button onClick={handleUpdateBalances} disabled={saving} className="gap-2 h-9 text-xs">
                        {saving ? "Saving..." : "Update Balances"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    {leaveTypes.map((type) => (
                        <div key={type._id} className="p-3.5 rounded-xl border bg-card space-y-2 shadow-2xs">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-foreground">{type.name}</label>
                                <span className="text-[11px] font-medium text-muted-foreground">Days Available</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                className="h-9 w-full rounded-lg border border-muted-foreground/30 bg-card px-3 text-xs font-semibold shadow-none outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
                                value={getBalance(type._id) === 0 ? "" : getBalance(type._id)}
                                onChange={(e: any) => handleBalanceChange(type._id, e.target.value === "" ? 0 : parseInt(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                    ))}
                </div>
                
                {!employee.isLeaveBalanceOverridden && (
                    <div className="flex items-center gap-3 p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl text-blue-900 dark:text-blue-200 text-xs">
                        <AlertTriangle className="h-4 w-4 text-blue-600 shrink-0" />
                        <p className="font-medium">
                            Current balances match the <span className="font-bold">{employee.department || "company"}</span> department defaults. Modifying values above will create a manual override.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const Label = ({ children, className, htmlFor }: any) => (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
        {children}
    </label>
);

const Input = ({ className, ...props }: any) => (
    <input
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
);
