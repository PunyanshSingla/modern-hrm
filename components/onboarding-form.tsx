"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { TechnologySelector } from "@/components/technology-selector";
import { DatePicker } from "@/components/date-picker";
import { DocumentPreview } from "@/components/document-preview";
import { 
    User, 
    Landmark, 
    Briefcase, 
    GraduationCap, 
    FileText, 
    Cpu, 
    Award, 
    Trash2, 
    Plus, 
    UploadCloud, 
    Link as LinkIcon, 
    AlertCircle,
    ExternalLink 
} from "lucide-react";
import { uploadToSupabase } from "@/lib/upload-to-supabase";
import { toast } from "sonner";

export default function OnboardingForm({ initialData, onUpdate, submitLabel = "Save & Submit for Verification" }: { initialData: any, onUpdate: () => void, submitLabel?: string }) {
    const [formData, setFormData] = useState({
        phone: initialData?.phone || "",
        address: initialData?.address || "",
        bankDetails: {
            accountHolderName: initialData?.bankDetails?.accountHolderName || "",
            accountNumber: initialData?.bankDetails?.accountNumber || "",
            bankName: initialData?.bankDetails?.bankName || "",
            ifscCode: initialData?.bankDetails?.ifscCode || ""
        },
        experience: initialData?.experience || [],
        education: initialData?.education || [],
        documents: initialData?.documents || [],
        skills: initialData?.skills || [],
        certifications: initialData?.certifications || []
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

    const handleAddItem = (field: 'experience' | 'education' | 'documents') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], {}]
        }));
    };

    const handleRemoveItem = (field: 'experience' | 'education' | 'documents', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_: any, i: number) => i !== index)
        }));
    };

    const handleChange = (field: 'experience' | 'education' | 'documents' | 'certifications', index: number, key: string, value: any) => {
        setFormData(prev => {
            const newArray = [...prev[field]];
            newArray[index] = { ...newArray[index], [key]: value };
            return { ...prev, [field]: newArray };
        });
    };

    const handleFileUpload = async (index: number, file: File) => {
        if (!file) return;
        setUploading(prev => ({ ...prev, [index]: true }));

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const path = `documents/${fileName}`;

            const url = await uploadToSupabase(path, file);

            handleChange('documents', index, 'url', url);
            handleChange('documents', index, 'type', 'file');
            toast.success("File uploaded successfully");
        } catch (error: any) {
            console.error("Upload failed", error);
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploading(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleCertificateUpload = async (index: number, file: File) => {
        if (!file) return;
        setUploading(prev => ({ ...prev, [`cert-${index}`]: true }));

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const path = `certificates/${fileName}`;

            const url = await uploadToSupabase(path, file);

            handleChange('certifications', index, 'url', url);
            toast.success("Certificate uploaded successfully");
        } catch (error: any) {
            console.error("Certificate upload failed", error);
            toast.error("Certificate upload failed: " + error.message);
        } finally {
            setUploading(prev => ({ ...prev, [`cert-${index}`]: false }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Phone Validation (Required)
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        // Address Validation (Required)
        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }

        // Bank Details Validation (All Required)
        if (!formData.bankDetails.accountHolderName.trim()) {
            newErrors.accountHolderName = "Account holder name is required";
        }
        if (!formData.bankDetails.accountNumber.trim()) {
            newErrors.accountNumber = "Account number is required";
        }
        if (!formData.bankDetails.bankName.trim()) {
            newErrors.bankName = "Bank name is required";
        }
        if (!formData.bankDetails.ifscCode.trim()) {
            newErrors.ifscCode = "IFSC code is required";
        }

        // Validate Experience (if added)
        formData.experience.forEach((exp: any, index: number) => {
            if (!exp.company?.trim()) {
                newErrors[`experience_${index}_company`] = "Company name is required";
            }
            if (!exp.role?.trim()) {
                newErrors[`experience_${index}_role`] = "Job title is required";
            }
            if (!exp.startDate) {
                newErrors[`experience_${index}_startDate`] = "Start date is required";
            }
            if (exp.startDate && exp.endDate) {
                const start = new Date(exp.startDate);
                const end = new Date(exp.endDate);
                if (end < start) {
                    newErrors[`experience_${index}_date`] = "End date must be after start date";
                }
            }
        });

        // Validate Education (if added)
        formData.education.forEach((edu: any, index: number) => {
            if (!edu.institution?.trim()) {
                newErrors[`education_${index}_institution`] = "Institution is required";
            }
            if (!edu.degree?.trim()) {
                newErrors[`education_${index}_degree`] = "Degree is required";
            }
            if (!edu.startDate) {
                newErrors[`education_${index}_startDate`] = "Start date is required";
            }
        });

        // Validate Documents (if added)
        formData.documents.forEach((doc: any, index: number) => {
            if (!doc.documentType) {
                newErrors[`documents_${index}_documentType`] = "Document type is required";
            }
            if (!doc.name?.trim()) {
                newErrors[`documents_${index}_name`] = "Document name is required";
            }
            if (!doc.url) {
                newErrors[`documents_${index}_url`] = "Please upload a file or enter a link";
            }
        });

        // Validate Certifications (if added)
        formData.certifications.forEach((cert: any, index: number) => {
            if (!cert.name?.trim()) {
                newErrors[`certifications_${index}_name`] = "Certification name is required";
            }
            if (!cert.issuer?.trim()) {
                newErrors[`certifications_${index}_issuer`] = "Issuing organization is required";
            }
            if (!cert.url) {
                newErrors[`certifications_${index}_url`] = "Please upload a file or enter a link";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/employee/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, status: "pending_verification" })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Details saved successfully!");
                onUpdate();
            } else {
                toast.error(data.error || "Failed to save profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
            {/* Personal Details */}
            <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-muted/10 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                            <User className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Personal Details</CardTitle>
                            <CardDescription className="text-xs">Provide your primary contact and address details.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1">
                            Phone Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="phone"
                            placeholder="e.g. +91 9876543210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={errors.phone ? "border-destructive focus-visible:ring-destructive" : "border-muted-foreground/30 focus-visible:ring-primary"}
                        />
                        {errors.phone && (
                            <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                <AlertCircle className="h-3.5 w-3.5" /> {errors.phone}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-xs font-semibold flex items-center gap-1">
                            Current Address <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="address"
                            rows={3}
                            placeholder="Enter your complete residential address..."
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={errors.address ? "border-destructive focus-visible:ring-destructive" : "border-muted-foreground/30 focus-visible:ring-primary resize-none"}
                        />
                        {errors.address && (
                            <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                <AlertCircle className="h-3.5 w-3.5" /> {errors.address}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Bank Details */}
            <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-muted/10 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                            <Landmark className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Bank Account Details</CardTitle>
                            <CardDescription className="text-xs">Required for payroll processing and salary deposits.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold flex items-center gap-1">
                            Account Holder Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="Exact name as in bank records"
                            value={formData.bankDetails.accountHolderName}
                            onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value } })}
                            className={errors.accountHolderName ? "border-destructive focus-visible:ring-destructive" : "border-muted-foreground/30 focus-visible:ring-primary"}
                        />
                        {errors.accountHolderName && (
                            <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                <AlertCircle className="h-3.5 w-3.5" /> {errors.accountHolderName}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold flex items-center gap-1">
                            Account Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="Enter bank account number"
                            value={formData.bankDetails.accountNumber}
                            onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                            className={errors.accountNumber ? "border-destructive focus-visible:ring-destructive" : "border-muted-foreground/30 focus-visible:ring-primary"}
                        />
                        {errors.accountNumber && (
                            <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                <AlertCircle className="h-3.5 w-3.5" /> {errors.accountNumber}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold flex items-center gap-1">
                            Bank Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="e.g. HDFC Bank, ICICI Bank"
                            value={formData.bankDetails.bankName}
                            onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                            className={errors.bankName ? "border-destructive focus-visible:ring-destructive" : "border-muted-foreground/30 focus-visible:ring-primary"}
                        />
                        {errors.bankName && (
                            <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                <AlertCircle className="h-3.5 w-3.5" /> {errors.bankName}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold flex items-center gap-1">
                            IFSC Code <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="e.g. HDFC0001234"
                            value={formData.bankDetails.ifscCode}
                            onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value } })}
                            className={errors.ifscCode ? "border-destructive focus-visible:ring-destructive" : "border-muted-foreground/30 focus-visible:ring-primary"}
                        />
                        {errors.ifscCode && (
                            <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                <AlertCircle className="h-3.5 w-3.5" /> {errors.ifscCode}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Work Experience */}
            <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-muted/10 p-4 sm:p-5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                            <Briefcase className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Work Experience</CardTitle>
                            <CardDescription className="text-xs">Add your previous employment records.</CardDescription>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('experience')} className="h-8 text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Experience
                    </Button>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 space-y-6">
                    {formData.experience.map((exp: any, index: number) => (
                        <div key={index} className="space-y-4 p-5 rounded-xl border border-border bg-muted/15 relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveItem('experience', index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Company Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={exp.company || ""}
                                        onChange={(e) => handleChange('experience', index, 'company', e.target.value)}
                                        placeholder="e.g. Google"
                                        className={errors[`experience_${index}_company`] ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors[`experience_${index}_company`] && (
                                        <p className="text-xs text-destructive font-medium">{errors[`experience_${index}_company`]}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Job Title / Designation <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={exp.role || ""}
                                        onChange={(e) => handleChange('experience', index, 'role', e.target.value)}
                                        placeholder="e.g. Senior Software Engineer"
                                        className={errors[`experience_${index}_role`] ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors[`experience_${index}_role`] && (
                                        <p className="text-xs text-destructive font-medium">{errors[`experience_${index}_role`]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Employment Type</Label>
                                    <select
                                        className="flex h-9 w-full rounded-lg border border-muted-foreground/30 bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        value={exp.employmentType || ""}
                                        onChange={(e) => handleChange('experience', index, 'employmentType', e.target.value)}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Freelance">Freelance</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Start Date <span className="text-destructive">*</span></Label>
                                    <DatePicker
                                        date={exp.startDate ? new Date(exp.startDate) : undefined}
                                        onSelect={(date) => handleChange('experience', index, 'startDate', date?.toISOString())}
                                        placeholder="Select start date"
                                    />
                                    {errors[`experience_${index}_startDate`] && (
                                        <p className="text-xs text-destructive font-medium mt-1">{errors[`experience_${index}_startDate`]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">End Date</Label>
                                    <DatePicker
                                        date={exp.endDate ? new Date(exp.endDate) : undefined}
                                        onSelect={(date) => handleChange('experience', index, 'endDate', date?.toISOString())}
                                        placeholder="Select end date"
                                    />
                                    {errors[`experience_${index}_date`] && (
                                        <p className="text-xs text-destructive font-medium mt-1">{errors[`experience_${index}_date`]}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Reason for Leaving</Label>
                                    <Input
                                        value={exp.reasonForLeaving || ""}
                                        onChange={(e) => handleChange('experience', index, 'reasonForLeaving', e.target.value)}
                                        placeholder="e.g. Career growth"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Tools / Technologies Used</Label>
                                <TechnologySelector
                                    selectedTechnologies={exp.technologies || []}
                                    onChange={(techs) => handleChange('experience', index, 'technologies', techs)}
                                />
                            </div>
                        </div>
                    ))}
                    {formData.experience.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground border border-dashed rounded-xl border-border/80">
                            No work experience records added.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Education */}
            <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-muted/10 p-4 sm:p-5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                            <GraduationCap className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Education</CardTitle>
                            <CardDescription className="text-xs">Add your academic qualifications.</CardDescription>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('education')} className="h-8 text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Education
                    </Button>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 space-y-6">
                    {formData.education.map((edu: any, index: number) => (
                        <div key={index} className="space-y-4 p-5 rounded-xl border border-border bg-muted/15 relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveItem('education', index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Institution / University Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={edu.institution || ""}
                                        onChange={(e) => handleChange('education', index, 'institution', e.target.value)}
                                        placeholder="e.g. Harvard University"
                                        className={errors[`education_${index}_institution`] ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors[`education_${index}_institution`] && (
                                        <p className="text-xs text-destructive font-medium">{errors[`education_${index}_institution`]}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Degree / Certification <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={edu.degree || ""}
                                        onChange={(e) => handleChange('education', index, 'degree', e.target.value)}
                                        placeholder="e.g. Bachelor of Science"
                                        className={errors[`education_${index}_degree`] ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors[`education_${index}_degree`] && (
                                        <p className="text-xs text-destructive font-medium">{errors[`education_${index}_degree`]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Start Date <span className="text-destructive">*</span></Label>
                                    <DatePicker
                                        date={edu.startDate ? new Date(edu.startDate) : undefined}
                                        onSelect={(date) => handleChange('education', index, 'startDate', date?.toISOString())}
                                        placeholder="Select start date"
                                    />
                                    {errors[`education_${index}_startDate`] && (
                                        <p className="text-xs text-destructive font-medium mt-1">{errors[`education_${index}_startDate`]}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">End Date</Label>
                                    <DatePicker
                                        date={edu.endDate ? new Date(edu.endDate) : undefined}
                                        onSelect={(date) => handleChange('education', index, 'endDate', date?.toISOString())}
                                        placeholder="Select end date"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.education.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground border border-dashed rounded-xl border-border/80">
                            No education records added.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Documents */}
            <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-muted/10 p-4 sm:p-5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                            <FileText className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Verification Documents</CardTitle>
                            <CardDescription className="text-xs">Upload files or provide links for profile verification.</CardDescription>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('documents')} className="h-8 text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Document
                    </Button>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 space-y-6">
                    {formData.documents.map((doc: any, index: number) => (
                        <div key={index} className="space-y-4 p-5 rounded-xl border border-border bg-muted/15 relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveItem('documents', index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Document Type <span className="text-destructive">*</span></Label>
                                    <select
                                        className="flex h-9 w-full rounded-lg border border-muted-foreground/30 bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        value={doc.documentType || ""}
                                        onChange={(e) => handleChange('documents', index, 'documentType', e.target.value)}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Resume">Resume</option>
                                        <option value="ID Proof">ID Proof</option>
                                        <option value="Address Proof">Address Proof</option>
                                        <option value="Educational Certificate">Educational Certificate</option>
                                        <option value="Experience Letter">Experience Letter</option>
                                        <option value="Offer Letter">Offer Letter</option>
                                        <option value="Relieving Letter">Relieving Letter</option>
                                        <option value="Passport">Passport</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors[`documents_${index}_documentType`] && (
                                        <p className="text-xs text-destructive font-medium mt-1">{errors[`documents_${index}_documentType`]}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Document Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        placeholder="e.g. Aadhaar Card, Degree Certificate"
                                        value={doc.name || ""}
                                        onChange={(e) => handleChange('documents', index, 'name', e.target.value)}
                                        className={errors[`documents_${index}_name`] ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors[`documents_${index}_name`] && (
                                        <p className="text-xs text-destructive font-medium mt-1">{errors[`documents_${index}_name`]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Issued By</Label>
                                    <Input
                                        placeholder="e.g. Government of India, University"
                                        value={doc.issuedBy || ""}
                                        onChange={(e) => handleChange('documents', index, 'issuedBy', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Issue Date</Label>
                                    <DatePicker
                                        date={doc.issueDate ? new Date(doc.issueDate) : undefined}
                                        onSelect={(date) => handleChange('documents', index, 'issueDate', date?.toISOString())}
                                        placeholder="Select issue date"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                                        <UploadCloud className="h-4 w-4" /> Upload File
                                    </Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        disabled={uploading[index] || !!doc.url}
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(index, e.target.files[0])}
                                        className="h-9 text-xs"
                                    />
                                    {uploading[index] && <p className="text-[10px] text-muted-foreground animate-pulse">Uploading...</p>}
                                    {doc.url && doc.type === 'file' && (
                                        <p className="text-xs font-semibold text-emerald-600">✓ Uploaded successfully</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                                        <LinkIcon className="h-3.5 w-3.5" /> OR Enter URL
                                    </Label>
                                    <Input
                                        placeholder="https://"
                                        value={doc.type === 'link' ? doc.url : ''}
                                        disabled={doc.type === 'file'}
                                        onChange={(e) => {
                                            handleChange('documents', index, 'url', e.target.value);
                                            handleChange('documents', index, 'type', 'link');
                                        }}
                                        className="h-9 text-xs"
                                    />
                                    {doc.url && doc.type === 'link' && (
                                        <p className="text-xs font-semibold text-emerald-600">✓ Link registered</p>
                                    )}
                                </div>
                            </div>

                            {errors[`documents_${index}_url`] && (
                                <p className="text-xs text-destructive font-medium mt-1">{errors[`documents_${index}_url`]}</p>
                            )}

                            {doc.url && (
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreviewDoc({ url: doc.url, name: doc.name || `Document ${index + 1}` })}
                                        className="h-8 text-xs font-medium"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Preview Document
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                    {formData.documents.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground border border-dashed rounded-xl border-border/80">
                            No verification documents uploaded. At least one ID proof and Resume is recommended.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Skills */}
            <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-muted/10 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                            <Cpu className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Technical Skills <span className="text-xs font-normal text-muted-foreground">(Optional)</span></CardTitle>
                            <CardDescription className="text-xs font-normal mt-0.5">Select the tools and core technologies you are proficient in.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                    <TechnologySelector
                        selectedTechnologies={formData.skills}
                        onChange={(techs) => setFormData({ ...formData, skills: techs })}
                    />
                </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-muted/10 p-4 sm:p-5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                            <Award className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Certifications <span className="text-xs font-normal text-muted-foreground">(Optional)</span></CardTitle>
                            <CardDescription className="text-xs">Add your professional certificates and credentials.</CardDescription>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({
                            ...formData,
                            certifications: [...formData.certifications, { name: '', issuer: '', date: null, url: '' }]
                        })}
                        className="h-8 text-xs font-semibold"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Certification
                    </Button>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 space-y-6">
                    {formData.certifications.map((cert: any, index: number) => (
                        <div key={index} className="space-y-4 p-5 rounded-xl border border-border bg-muted/15 relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setFormData({
                                    ...formData,
                                    certifications: formData.certifications.filter((_: any, i: number) => i !== index)
                                })}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Certification Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        placeholder="e.g. AWS Certified Solutions Architect"
                                        value={cert.name}
                                        onChange={(e) => handleChange('certifications', index, 'name', e.target.value)}
                                        className={errors[`certifications_${index}_name`] ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors[`certifications_${index}_name`] && (
                                        <p className="text-xs text-destructive font-medium mt-1">{errors[`certifications_${index}_name`]}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Issuing Organization <span className="text-destructive">*</span></Label>
                                    <Input
                                        placeholder="e.g. Amazon Web Services"
                                        value={cert.issuer}
                                        onChange={(e) => handleChange('certifications', index, 'issuer', e.target.value)}
                                        className={errors[`certifications_${index}_issuer`] ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors[`certifications_${index}_issuer`] && (
                                        <p className="text-xs text-destructive font-medium mt-1">{errors[`certifications_${index}_issuer`]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Date Obtained</Label>
                                    <DatePicker
                                        date={cert.date ? new Date(cert.date) : undefined}
                                        onSelect={(date) => handleChange('certifications', index, 'date', date?.toISOString())}
                                        placeholder="Select date"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                                        <UploadCloud className="h-4 w-4" /> Upload File
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-9 text-xs"
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = '.pdf,.jpg,.jpeg,.png';
                                            input.onchange = (e: any) => {
                                                const file = e.target?.files?.[0];
                                                if (file) handleCertificateUpload(index, file);
                                            };
                                            input.click();
                                        }}
                                        disabled={uploading[`cert-${index}`] || !!cert.url}
                                    >
                                        {uploading[`cert-${index}`] ? "Uploading..." : "Select File"}
                                    </Button>
                                    {cert.url && !uploading[`cert-${index}`] && (
                                        <p className="text-xs font-semibold text-emerald-600">✓ Uploaded successfully</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                                        <LinkIcon className="h-3.5 w-3.5" /> OR Enter URL
                                    </Label>
                                    <Input
                                        type="url"
                                        placeholder="Enter certificate URL"
                                        value={cert.url || ''}
                                        onChange={(e) => handleChange('certifications', index, 'url', e.target.value)}
                                        disabled={uploading[`cert-${index}`]}
                                        className="h-9 text-xs"
                                    />
                                    {cert.url && (
                                        <p className="text-xs font-semibold text-emerald-600">✓ Registered successfully</p>
                                    )}
                                </div>
                            </div>

                            {errors[`certifications_${index}_url`] && (
                                <p className="text-xs text-destructive font-medium mt-1">{errors[`certifications_${index}_url`]}</p>
                            )}

                            {cert.url && (
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreviewDoc({ url: cert.url, name: cert.name || `Certification ${index + 1}` })}
                                        className="h-8 text-xs font-medium"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Preview Credential
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                    {formData.certifications.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground border border-dashed rounded-xl border-border/80">
                            No certifications added.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/95 shadow-md">
                {loading ? "Saving..." : submitLabel}
            </Button>

            {previewDoc && (
                <DocumentPreview
                    url={previewDoc.url}
                    name={previewDoc.name}
                    isOpen={!!previewDoc}
                    onClose={() => setPreviewDoc(null)}
                />
            )}
        </form>
    );
}
