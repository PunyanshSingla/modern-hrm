"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <div className="h-full bg-gradient-to-br from-background to-muted/20">
            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.push('/admin/employees')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Employees
                    </Button>
                    
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                {employee.firstName} {employee.lastName}
                            </h1>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    {employee.position}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Building className="h-4 w-4" />
                                    {employee.department}
                                </span>
                            </div>
                        </div>
                        <Badge 
                            variant={employee.status === 'verified' ? 'default' : 'secondary'} 
                            className="text-lg px-4 py-2"
                        >
                            {employee.status === 'verified' ? (
                                <><CheckCircle className="h-4 w-4 mr-2" /> Verified</>
                            ) : (
                                'Pending Verification'
                            )}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="salary">Salary</TabsTrigger>
                            <TabsTrigger value="leaves">Leave History</TabsTrigger>
                            <TabsTrigger value="it-requests">IT Requests</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="salary" className="mt-6">
                            <SalaryTab 
                                employee={employee} 
                                onUpdate={(updated: any) => setEmployee(updated)} 
                            />
                        </TabsContent>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Contact Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Mail className="h-5 w-5" />
                                                Contact Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                    <Mail className="h-4 w-4" /> Email
                                                </label>
                                                <p className="text-base">{employee.userId?.email || employee.email || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                    <Phone className="h-4 w-4" /> Phone
                                                </label>
                                                <p className="text-base">{employee.phone || "Not provided"}</p>
                                            </div>
                                            <div className="space-y-1 md:col-span-2">
                                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" /> Address
                                                </label>
                                                <p className="text-base">{employee.address || "Not provided"}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Bank Details */}
                                    {employee.bankDetails && (employee.bankDetails.accountHolderName || employee.bankDetails.accountNumber) && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <CreditCard className="h-5 w-5" />
                                                    Bank Details
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-muted-foreground">Account Holder Name</label>
                                                    <p className="text-base font-medium">{employee.bankDetails.accountHolderName || "N/A"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                                                    <p className="text-base font-medium">{employee.bankDetails.bankName || "N/A"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                                                    <p className="text-base font-mono">{employee.bankDetails.accountNumber || "N/A"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
                                                    <p className="text-base font-mono">{employee.bankDetails.ifscCode || "N/A"}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Work Experience */}
                                    {employee.experience && employee.experience.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Briefcase className="h-5 w-5" />
                                                    Work Experience
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {employee.experience.map((exp: any, i: number) => (
                                                    <div key={i} className="border-l-4 border-primary pl-4 py-2 space-y-2">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{exp.role || "Role not specified"}</h3>
                                                                <p className="text-muted-foreground flex items-center gap-2">
                                                                    <Building className="h-4 w-4" />
                                                                    {exp.company || "Company not specified"}
                                                                </p>
                                                            </div>
                                                            {exp.employmentType && (
                                                                <Badge variant="outline">{exp.employmentType}</Badge>
                                                            )}
                                                        </div>
                                                        {(exp.startDate || exp.endDate) && (
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
                                                            </p>
                                                        )}
                                                        {exp.reasonForLeaving && (
                                                            <p className="text-sm">
                                                                <span className="font-medium">Reason for leaving:</span> {exp.reasonForLeaving}
                                                            </p>
                                                        )}
                                                        {exp.technologies && exp.technologies.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {exp.technologies.map((techName: string, idx: number) => {
                                                                    const techData = getTechData(techName);
                                                                    return (
                                                                        <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1.5 text-xs flex items-center gap-1">
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
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <GraduationCap className="h-5 w-5" />
                                                    Education
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {employee.education.map((edu: any, i: number) => (
                                                    <div key={i} className="border-l-4 border-blue-500 pl-4 py-2 space-y-1">
                                                        <h3 className="font-semibold text-lg">{edu.degree || "Degree not specified"}</h3>
                                                        <p className="text-muted-foreground">{edu.institution || "Institution not specified"}</p>
                                                        {(edu.startDate || edu.endDate) && (
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Skills */}
                                    {employee.skills && employee.skills.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Code className="h-5 w-5" />
                                                    Skills
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {employee.skills.map((skill: string, i: number) => {
                                                        const techData = getTechData(skill);
                                                        return (
                                                            <Badge key={i} variant="secondary" className="pl-2 pr-2 py-1.5 text-sm flex items-center gap-1.5">
                                                                <TechIcon tech={techData} size={16} />
                                                                {skill}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Certifications */}
                                    {employee.certifications && employee.certifications.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    Certifications
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {employee.certifications.map((cert: any, i: number) => (
                                                    <div key={i} className="border-l-4 border-green-500 pl-4 py-2 space-y-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{cert.name || "Certification"}</h3>
                                                                <p className="text-muted-foreground">{cert.issuer || "Issuer not specified"}</p>
                                                                {cert.date && (
                                                                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                                        <Calendar className="h-4 w-4" />
                                                                        {formatDate(cert.date)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {cert.url ? (
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="text-xs"
                                                                    onClick={() => setPreviewDoc({ url: cert.url, name: cert.name || `Certification ${i+1}` })}
                                                                >
                                                                    <FileText className="h-3 w-3 mr-1" />
                                                                    Preview
                                                                </Button>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">No document</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    {/* Sidebar actions reused here */}
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

                        <TabsContent value="leaves" className="mt-6">
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

                        <TabsContent value="it-requests" className="mt-6">
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
                    </Tabs>
                </div>

                {/* Document Preview Modal */}
                {previewDoc && (
                    <DocumentPreview
                        url={previewDoc.url}
                        name={previewDoc.name}
                        isOpen={!!previewDoc}
                        onClose={() => setPreviewDoc(null)}
                    />
                )}
            </div>
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

    if (loading) return <div className="p-8 text-center text-muted-foreground uppercase font-black italic tracking-widest animate-pulse">Loading structures...</div>

    return (
        <Card className="border-2 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl font-black uppercase italic tracking-tight">Salary Configuration</CardTitle>
                        <CardDescription className="font-bold uppercase text-[10px]">Assign a structural template to this employee</CardDescription>
                    </div>
                    <Button onClick={handleAssign} disabled={saving || !selectedId} className="rounded-xl font-black h-10 px-6 uppercase tracking-tight">
                        {saving ? "Saving..." : "Assign Structure"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
                <div className="max-w-md space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Structure Template</label>
                    <select 
                        className="w-full h-12 rounded-xl border-2 bg-background px-4 font-bold text-lg focus:border-primary transition-all appearance-none"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                    >
                        <option value="">No Structure Assigned</option>
                        {structures.map((s) => (
                            <option key={s._id} value={s._id}>{s.name} - ₹{(s.ctcAnnual/12).toLocaleString()}/mo</option>
                        ))}
                    </select>
                </div>

                {currentStructure && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-border" />
                            <Badge variant="outline" className="uppercase font-black tracking-widest text-[9px] px-3">Structure Preview</Badge>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {currentStructure.components.map((c: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-muted-foreground/10 font-bold">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-muted-foreground uppercase tracking-tighter">{c.type}</span>
                                        <span className="uppercase tracking-tight text-sm">{c.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-primary">{c.valueType === 'Percentage' ? `${c.value}% of Base` : `₹${c.value.toLocaleString()}`}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-black uppercase italic text-sm text-primary">Estimated Monthly Gross</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Based on template annual CTC of ₹{currentStructure.ctcAnnual.toLocaleString()}</p>
                                </div>
                                <div className="text-3xl font-black text-primary italic">
                                    ₹{Math.round(currentStructure.ctcAnnual / 12).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
