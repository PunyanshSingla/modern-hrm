
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { TechnologySelector } from "@/components/technology-selector";
import { DatePicker } from "@/components/date-picker";
import { DocumentPreview } from "@/components/document-preview";
import { Eye } from "lucide-react";
import { uploadToSupabase } from "@/lib/upload-to-supabase";

export default function OnboardingForm({ initialData, onUpdate }: { initialData: any, onUpdate: () => void }) {
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
        const newArray = [...formData[field]];
        newArray[index] = { ...newArray[index], [key]: value };
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const handleFileUpload = async (index: number, file: File) => {
        if (!file) return;
        setUploading(prev => ({ ...prev, [index]: true }));

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const path = `documents/${fileName}`;

            const url = await uploadToSupabase(path, file)

            handleChange('documents', index, 'url', url);
            handleChange('documents', index, 'type', 'file');

        } catch (error: any) {
            console.error("Upload failed", error);
            alert("Upload failed: " + error.message);
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

        } catch (error: any) {
            console.error("Certificate upload failed", error);
            alert("Certificate upload failed: " + error.message);
        } finally {
            setUploading(prev => ({ ...prev, [`cert-${index}`]: false }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Validate phone (optional but if provided, should be valid)
        if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        // Validate bank details (all or none)
        const bankFields = Object.values(formData.bankDetails).filter(v => v);
        if (bankFields.length > 0 && bankFields.length < 4) {
            newErrors.bankDetails = "Please complete all bank details or leave them empty";
        }

        // Validate experience dates
        formData.experience.forEach((exp: any, index: number) => {
            if (exp.startDate && exp.endDate) {
                const start = new Date(exp.startDate);
                const end = new Date(exp.endDate);
                if (end < start) {
                    newErrors[`experience_${index}_date`] = "End date must be after start date";
                }
            }
        });

        setErrors(newErrors);
        // Validate documents
        formData.documents.forEach((doc: any, index: number) => {
            if (!doc.url) {
                newErrors[`documents_${index}_url`] = "Please upload a file or provide a link";
            }
        });

        // Validate certifications
        formData.certifications.forEach((cert: any, index: number) => {
            if (!cert.url) {
                newErrors[`certifications_${index}_url`] = "Please upload a certificate or provide a link";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            alert("Please fix the errors in the form");
            return;
        }

        setLoading(true);
        console.log(formData, "formData")
        try {
            const res = await fetch("/api/employee/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert("Details saved successfully!");
                onUpdate();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number <span className="text-xs text-muted-foreground"></span></Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address <span className="text-xs text-muted-foreground"></span></Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bank Details <span className="text-sm font-normal text-muted-foreground"></span></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {errors.bankDetails && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{errors.bankDetails}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Account Holder Name</Label>
                            <Input
                                value={formData.bankDetails.accountHolderName}
                                onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Number</Label>
                            <Input
                                value={formData.bankDetails.accountNumber}
                                onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <Input
                                value={formData.bankDetails.bankName}
                                onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>IFSC Code</Label>
                            <Input
                                value={formData.bankDetails.ifscCode}
                                onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value } })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Work Experience <span className="text-sm font-normal text-muted-foreground"></span></CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('experience')}>Add Experience</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {formData.experience.map((exp: any, index: number) => (
                        <div key={index} className="space-y-4 p-6 border rounded relative bg-muted/20">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveItem('experience', index)}>
                                <span className="sr-only">Remove</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </Button>

                            {errors[`experience_${index}_date`] && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600">{errors[`experience_${index}_date`]}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input
                                        value={exp.company || ""}
                                        onChange={(e) => handleChange('experience', index, 'company', e.target.value)}
                                        placeholder="e.g. Google"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Job Title / Designation</Label>
                                    <Input
                                        value={exp.role || ""}
                                        onChange={(e) => handleChange('experience', index, 'role', e.target.value)}
                                        placeholder="e.g. Senior Software Engineer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Employment Type</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <DatePicker
                                        date={exp.startDate ? new Date(exp.startDate) : undefined}
                                        onSelect={(date) => handleChange('experience', index, 'startDate', date?.toISOString())}
                                        placeholder="Select start date"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <DatePicker
                                        date={exp.endDate ? new Date(exp.endDate) : undefined}
                                        onSelect={(date) => handleChange('experience', index, 'endDate', date?.toISOString())}

                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason for Leaving</Label>
                                    <Input
                                        value={exp.reasonForLeaving || ""}
                                        onChange={(e) => handleChange('experience', index, 'reasonForLeaving', e.target.value)}
                                        placeholder="e.g. Career growth"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tools / Technologies Used</Label>
                                <TechnologySelector
                                    selectedTechnologies={exp.technologies || []}
                                    onChange={(techs) => handleChange('experience', index, 'technologies', techs)}
                                />
                            </div>
                        </div>
                    ))}
                    {formData.experience.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No experience added. Click "Add Experience" to get started.</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Education <span className="text-sm font-normal text-muted-foreground"></span></CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('education')}>Add Education</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {formData.education.map((edu: any, index: number) => (
                        <div key={index} className="space-y-4 p-6 border rounded relative bg-muted/20">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveItem('education', index)}>
                                <span className="sr-only">Remove</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Institution</Label>
                                    <Input
                                        value={edu.institution || ""}
                                        onChange={(e) => handleChange('education', index, 'institution', e.target.value)}
                                        placeholder="e.g. Harvard University"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Degree</Label>
                                    <Input
                                        value={edu.degree || ""}
                                        onChange={(e) => handleChange('education', index, 'degree', e.target.value)}
                                        placeholder="e.g. Bachelor of Science"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <DatePicker
                                        date={edu.startDate ? new Date(edu.startDate) : undefined}
                                        onSelect={(date) => handleChange('education', index, 'startDate', date?.toISOString())}
                                        placeholder="Select start date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <DatePicker
                                        date={edu.endDate ? new Date(edu.endDate) : undefined}
                                        onSelect={(date) => handleChange('education', index, 'endDate', date?.toISOString())}
                                        placeholder="Select end date"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.education.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No education added.</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Documents <span className="text-sm font-normal text-muted-foreground"></span></CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('documents')}>Add Document</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {formData.documents.map((doc: any, index: number) => (
                        <div key={index} className="space-y-4 p-6 border rounded relative bg-muted/20">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveItem('documents', index)}>
                                <span className="sr-only">Remove</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Document Type</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                </div>
                                <div className="space-y-2">
                                    <Label>Document Name</Label>
                                    <Input
                                        placeholder="e.g. Aadhar Card, Degree Certificate"
                                        value={doc.name || ""}
                                        onChange={(e) => handleChange('documents', index, 'name', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Issued By</Label>
                                    <Input
                                        placeholder="e.g. Government of India, University"
                                        value={doc.issuedBy || ""}
                                        onChange={(e) => handleChange('documents', index, 'issuedBy', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Issue Date <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                    <DatePicker
                                        date={doc.issueDate ? new Date(doc.issueDate) : undefined}
                                        onSelect={(date) => handleChange('documents', index, 'issueDate', date?.toISOString())}
                                        placeholder="Select issue date"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Upload File <span className="text-xs text-muted-foreground">(PDF, JPG, PNG)</span></Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        disabled={uploading[index] || !!doc.url}
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(index, e.target.files[0])}
                                    />
                                    {uploading[index] && <p className="text-xs text-muted-foreground">Uploading...</p>}
                                    {doc.url && doc.type === 'file' && (
                                        <p className="text-xs text-green-600">✓ File uploaded successfully</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>OR Enter Link</Label>
                                    <Input
                                        placeholder="https://"
                                        value={doc.type === 'link' ? doc.url : ''}
                                        disabled={doc.type === 'file'}
                                        onChange={(e) => {
                                            handleChange('documents', index, 'url', e.target.value);
                                            handleChange('documents', index, 'type', 'link');
                                        }}
                                    />
                                    {doc.url && doc.type === 'link' && (
                                        <p className="text-xs text-green-600">✓ Link added</p>
                                    )}
                                    {errors[`documents_${index}_url`] && (
                                        <p className="text-xs text-red-500 mt-1">{errors[`documents_${index}_url`]}</p>
                                    )}
                                </div>
                            </div>

                            {doc.url && (
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreviewDoc({ url: doc.url, name: doc.name || `Document ${index + 1}` })}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Preview
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                    {formData.documents.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No documents added.</p>}
                </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Skills <span className="text-sm font-normal text-muted-foreground">(Optional)</span></CardTitle>
                </CardHeader>
                <CardContent>
                    <TechnologySelector
                        selectedTechnologies={formData.skills}
                        onChange={(techs) => setFormData({ ...formData, skills: techs })}
                    />
                </CardContent>
            </Card>

            {/* Certifications Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Certifications <span className="text-sm font-normal text-muted-foreground">(Optional)</span></CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({
                                ...formData,
                                certifications: [...formData.certifications, { name: '', issuer: '', date: null, url: '' }]
                            })}
                        >
                            Add Certification
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {formData.certifications.map((cert: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg bg-muted/20 space-y-3 relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setFormData({
                                    ...formData,
                                    certifications: formData.certifications.filter((_: any, i: number) => i !== index)
                                })}
                            >
                                Remove
                            </Button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Certification Name *</Label>
                                    <Input
                                        placeholder="e.g., AWS Certified Solutions Architect"
                                        value={cert.name}
                                        onChange={(e) => handleChange('certifications', index, 'name', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Issuing Organization *</Label>
                                    <Input
                                        placeholder="e.g., Amazon Web Services"
                                        value={cert.issuer}
                                        onChange={(e) => handleChange('certifications', index, 'issuer', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Date Obtained</Label>
                                    <DatePicker
                                        date={cert.date ? new Date(cert.date) : undefined}
                                        onSelect={(date) => handleChange('certifications', index, 'date', date?.toISOString())}
                                        placeholder="Select date"
                                    />
                                </div>
                            </div>

                            {/* File Upload or Link */}
                            <div className="space-y-3 pt-3 border-t">
                                <Label>Certificate File or Link</Label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
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
                                            {uploading[`cert-${index}`] ? "Uploading..." : "Upload File"}
                                        </Button>
                                    </div>
                                    {uploading[`cert-${index}`] && (
                                        <p className="text-xs text-blue-600">Uploading certificate...</p>
                                    )}
                                    {cert.url && !uploading[`cert-${index}`] && (
                                        <p className="text-xs text-green-600">✓ Certificate uploaded successfully</p>
                                    )}

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">Or</span>
                                        </div>
                                    </div>

                                    <Input
                                        type="url"
                                        placeholder="Enter certificate URL"
                                        value={cert.url || ''}
                                        onChange={(e) => handleChange('certifications', index, 'url', e.target.value)}
                                        disabled={uploading[`cert-${index}`]}
                                    />

                                    {cert.url && (
                                        <div className="mt-2 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPreviewDoc({ url: cert.url, name: cert.name || `Certification ${index + 1}` })}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Preview
                                            </Button>
                                        </div>
                                    )}
                                    {errors[`certifications_${index}_url`] && (
                                        <p className="text-xs text-red-500 mt-1">{errors[`certifications_${index}_url`]}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.certifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No certifications added.</p>}
                </CardContent>
            </Card>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save & Submit for Verification"}
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
