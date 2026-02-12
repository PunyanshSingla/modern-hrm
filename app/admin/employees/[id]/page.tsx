"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading employee details...</p>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex items-center justify-center min-h-screen">
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
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
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

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {employee.status !== 'verified' ? (
                                    <Button 
                                        className="w-full bg-green-600 hover:bg-green-700" 
                                        onClick={handleVerify} 
                                        disabled={actionLoading}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" /> 
                                        {actionLoading ? "Verifying..." : "Verify Employee"}
                                    </Button>
                                ) : (
                                    <div className="text-center text-green-600 font-medium border-2 border-green-600 p-3 rounded-lg bg-green-50">
                                        <CheckCircle className="inline mr-2 h-5 w-5" /> 
                                        Verified Employee
                                    </div>
                                )}
                                
                                {employee.status === 'rejected' ? (
                                    <div className="text-center text-red-600 font-medium border-2 border-red-600 p-3 rounded-lg bg-red-50">
                                        <Ban className="inline mr-2 h-5 w-5" /> 
                                        Rejected / Disabled
                                    </div>
                                ) : (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                disabled={actionLoading}
                                            >
                                                <Ban className="mr-2 h-4 w-4" /> Reject / Disable
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                                    <AlertTriangle className="h-5 w-5" />
                                                    Confirm Rejection
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to reject or disable this employee's profile? This action will mark them as rejected and may restrict their access.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                                                    Yes, Reject / Disable
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Documents ({employee.documents?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {employee.documents && employee.documents.length > 0 ? (
                                    <div className="space-y-3">
                                        {employee.documents.map((doc: any, i: number) => (
                                            <div 
                                                key={i} 
                                                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors space-y-2"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                                        {getFileIcon(doc.url)}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm truncate">
                                                                {doc.name || `Document ${i + 1}`}
                                                            </p>
                                                            {doc.documentType && (
                                                                <Badge variant="outline" className="text-xs mt-1">
                                                                    {doc.documentType}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {doc.issuedBy && (
                                                    <p className="text-xs text-muted-foreground">
                                                        <span className="font-medium">Issued by:</span> {doc.issuedBy}
                                                    </p>
                                                )}
                                                
                                                {doc.issueDate && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(doc.issueDate)}
                                                    </p>
                                                )}
                                                
                                                {doc.url ? (
                                                    <Button 
                                                        size="sm" 
                                                        variant="default" 
                                                        className="w-full text-xs mt-2"
                                                        onClick={() => setPreviewDoc({ url: doc.url, name: doc.name || `Document ${i + 1}` })}
                                                    >
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        Preview Document
                                                    </Button>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground italic mt-2 text-center">
                                                        No document uploaded
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No documents uploaded</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
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
