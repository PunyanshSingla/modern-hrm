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
    ExternalLink,
    Check,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    ShieldCheck,
    Phone,
    MapPin,
    Building2,
    FileCode,
    CheckCircle2
} from "lucide-react";
import { uploadToSupabase } from "@/lib/upload-to-supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
const STEPS = [
    { id: 1, title: "Personal & Skills", desc: "Contact details & tech stack", icon: User },
    { id: 2, title: "Bank & Payroll", desc: "Direct deposit account info", icon: Landmark },
    { id: 3, title: "Career & Education", desc: "Past employment & degrees", icon: Briefcase },
    { id: 4, title: "Documents & Submit", desc: "Upload ID & final verification", icon: ShieldCheck }
];

const COUNTRY_CODES = [
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+1", country: "US / Canada", flag: "🇺🇸" },
    { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+65", country: "Singapore", flag: "🇸🇬" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+86", country: "China", flag: "🇨🇳" }
];

function formatRawPhoneDigits(val: string, countryCode: string) {
    const digits = val.replace(/\D/g, "");
    if (countryCode === "+91") {
        if (digits.length <= 5) return digits;
        return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
    }
    if (countryCode === "+1") {
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 12)}`.trim();
}

function parseInitialPhone(raw: string) {
    if (!raw) return { countryCode: "+91", number: "" };
    const trimmed = raw.trim();
    for (const c of COUNTRY_CODES) {
        if (trimmed.startsWith(c.code)) {
            const numPart = trimmed.slice(c.code.length).trim();
            return { countryCode: c.code, number: formatRawPhoneDigits(numPart, c.code) };
        }
    }
    if (trimmed.startsWith("+")) {
        const parts = trimmed.split(" ");
        if (parts.length > 1) {
            return { countryCode: parts[0], number: parts.slice(1).join(" ") };
        }
    }
    return { countryCode: "+91", number: formatRawPhoneDigits(trimmed, "+91") };
}

export default function OnboardingForm({ initialData, onUpdate, submitLabel = "Submit Profile for Verification" }: { initialData: any, onUpdate: () => void, submitLabel?: string }) {
    const [activeStep, setActiveStep] = useState(0);
    const [lastStepChangedAt, setLastStepChangedAt] = useState(0);
    const parsedPhone = parseInitialPhone(initialData?.phone || "");
    const [phoneCountryCode, setPhoneCountryCode] = useState(parsedPhone.countryCode);
    const [phoneDisplayNumber, setPhoneDisplayNumber] = useState(parsedPhone.number);

    const changeStep = (newStep: number) => {
        setLastStepChangedAt(Date.now());
        setActiveStep(newStep);
    };

    const [formData, setFormData] = useState({
        phone: initialData?.phone || `${parsedPhone.countryCode} ${parsedPhone.number}`.trim(),
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

    const validatePhoneLive = (fullPhone: string, rawDigits: string) => {
        if (!rawDigits) {
            setErrors(prev => ({ ...prev, phone: "Phone number is required" }));
        } else if (rawDigits.length < 10) {
            setErrors(prev => ({ ...prev, phone: `Phone number must contain at least 10 digits (${rawDigits.length}/10 digits)` }));
        } else if (rawDigits.length > 15) {
            setErrors(prev => ({ ...prev, phone: "Phone number cannot exceed 15 digits" }));
        } else {
            setErrors(prev => {
                const newErr = { ...prev };
                delete newErr.phone;
                return newErr;
            });
        }
    };

    const handlePhoneCountryChange = (newCode: string) => {
        setPhoneCountryCode(newCode);
        const formatted = formatRawPhoneDigits(phoneDisplayNumber, newCode);
        setPhoneDisplayNumber(formatted);
        const fullPhone = `${newCode} ${formatted}`.trim();
        setFormData(prev => ({ ...prev, phone: fullPhone }));
        validatePhoneLive(fullPhone, formatted.replace(/\D/g, ""));
    };

    const handlePhoneNumberChange = (val: string) => {
        const formatted = formatRawPhoneDigits(val, phoneCountryCode);
        setPhoneDisplayNumber(formatted);
        const fullPhone = `${phoneCountryCode} ${formatted}`.trim();
        setFormData(prev => ({ ...prev, phone: fullPhone }));
        validatePhoneLive(fullPhone, formatted.replace(/\D/g, ""));
    };

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

    const validateStep = (stepIdx: number) => {
        const newErrors: { [key: string]: string } = {};

        if (stepIdx === 0) {
            const digits = phoneDisplayNumber.replace(/\D/g, "");
            if (!formData.phone.trim() || !phoneDisplayNumber.trim()) {
                newErrors.phone = "Phone number is required";
            } else if (digits.length < 10) {
                newErrors.phone = `Phone number must contain at least 10 digits (currently ${digits.length}/10 digits)`;
            } else if (digits.length > 15) {
                newErrors.phone = "Phone number cannot exceed 15 digits";
            }
            if (!formData.address.trim()) {
                newErrors.address = "Address is required";
            }
        }

        if (stepIdx === 1) {
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
        }

        if (stepIdx === 2) {
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
        }

        if (stepIdx === 3) {
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
        }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const validateFullForm = () => {
        let isValid = true;
        for (let i = 0; i < STEPS.length; i++) {
            if (!validateStep(i)) {
                isValid = false;
            }
        }
        return isValid;
    };

    const handleNextStep = () => {
        if (validateStep(activeStep)) {
            changeStep(Math.min(activeStep + 1, STEPS.length - 1));
        } else {
            toast.error("Please fill in all required fields in this step to continue.");
        }
    };

    const handlePrevStep = () => {
        changeStep(Math.max(activeStep - 1, 0));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent premature submit if user presses Enter key or submits on earlier steps
        if (activeStep < STEPS.length - 1) {
            handleNextStep();
            return;
        }

        // Prevent accidental submit from double clicks or fast clicks when transitioning to step 4
        if (Date.now() - lastStepChangedAt < 600) {
            return;
        }

        if (!validateFullForm()) {
            toast.error("Please fill in all required fields correctly across all steps.");
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
                toast.success("Profile submitted for HR verification!");
                onUpdate();
            } else {
                toast.error(data.error || "Failed to save profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit profile.");
        } finally {
            setLoading(false);
        }
    };

    const progressPercent = Math.round(((activeStep + 1) / STEPS.length) * 100);

    return (
        <form 
            onSubmit={handleSubmit} 
            onKeyDown={(e) => {
                if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
                    e.preventDefault();
                    if (activeStep < STEPS.length - 1) {
                        handleNextStep();
                    }
                }
            }}
            className="space-y-8 animate-in fade-in duration-300"
        >
            {/* Ultra-Sleek Stepper Navigation Bar */}
            <div className="relative rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-xl overflow-hidden">
                {/* Progress Bar Top Fill */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted/40 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-primary via-indigo-500 to-emerald-500 h-full transition-all duration-500 rounded-r-full shadow-sm"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                            <Sparkles className="h-3.5 w-3.5" /> Step {activeStep + 1} of {STEPS.length}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            {STEPS[activeStep].title}
                        </h2>
                        <p className="text-xs text-muted-foreground font-normal">
                            {STEPS[activeStep].desc}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <span className="text-sm font-bold text-foreground">{progressPercent}%</span>
                            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Progress</p>
                        </div>
                    </div>
                </div>

                {/* Modern Professional Segmented Stepper Grid (No Lines) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = idx < activeStep;
                        const isActive = idx === activeStep;

                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => {
                                    if (idx < activeStep || validateStep(activeStep)) {
                                        changeStep(idx);
                                    }
                                }}
                                className={cn(
                                    "relative text-left p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3.5 group outline-none",
                                    isActive && "bg-card border-primary/60 shadow-lg shadow-primary/10 ring-2 ring-primary/20",
                                    isCompleted && "bg-emerald-500/5 border-emerald-500/30 hover:bg-emerald-500/10",
                                    !isActive && !isCompleted && "bg-muted/30 border-border/60 hover:bg-muted/60 hover:border-border"
                                )}
                            >
                                {/* Step Icon Box */}
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-all duration-300",
                                    isActive && "bg-primary text-primary-foreground shadow-md shadow-primary/30",
                                    isCompleted && "bg-emerald-500 text-white shadow-xs",
                                    !isActive && !isCompleted && "bg-background border border-border/80 text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {isCompleted ? (
                                        <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                                    ) : (
                                        <Icon className="h-4.5 w-4.5" />
                                    )}
                                </div>

                                {/* Step Label & Status */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider",
                                            isActive && "text-primary",
                                            isCompleted && "text-emerald-600 dark:text-emerald-400",
                                            !isActive && !isCompleted && "text-muted-foreground"
                                        )}>
                                            Step 0{step.id}
                                        </span>
                                        {isCompleted && (
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded-md">
                                                Done
                                            </span>
                                        )}
                                        {isActive && (
                                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded-md animate-pulse">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <h4 className={cn(
                                        "text-xs font-bold truncate leading-snug",
                                        isActive && "text-foreground font-extrabold",
                                        isCompleted && "text-foreground font-semibold",
                                        !isActive && !isCompleted && "text-muted-foreground font-medium"
                                    )}>
                                        {step.title}
                                    </h4>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* STEP 1: Personal Details & Skills */}
            {activeStep === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                    <Card className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-lg overflow-hidden">
                        <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/5 via-muted/10 to-transparent p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Personal & Contact Info</CardTitle>
                                    <CardDescription className="text-xs">Enter your primary contact phone and residential address.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number <span className="text-destructive">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <select
                                        value={phoneCountryCode}
                                        onChange={(e) => handlePhoneCountryChange(e.target.value)}
                                        className={cn(
                                            "h-11 rounded-xl border border-border/80 bg-background/50 px-2.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs min-w-[110px] cursor-pointer",
                                            errors.phone && "border-destructive text-destructive focus-visible:ring-destructive"
                                        )}
                                    >
                                        {COUNTRY_CODES.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.flag} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="relative flex-1">
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder={phoneCountryCode === "+91" ? "98765 43210" : phoneCountryCode === "+1" ? "(555) 000-0000" : "123 456 7890"}
                                            value={phoneDisplayNumber}
                                            onChange={(e) => handlePhoneNumberChange(e.target.value)}
                                            className={cn(
                                                "h-11 rounded-xl text-xs font-medium bg-background/50 border-border/80 focus-visible:ring-primary shadow-xs pr-8",
                                                errors.phone && "border-destructive focus-visible:ring-destructive"
                                            )}
                                        />
                                        {phoneDisplayNumber.replace(/\D/g, "").length >= 10 && !errors.phone && (
                                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
                                        )}
                                    </div>
                                </div>
                                {errors.phone ? (
                                    <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1 animate-in fade-in duration-200">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.phone}
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-muted-foreground">
                                        Country code auto-attached ({phoneCountryCode}). Minimum 10 digits required.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-primary" /> Residential Address <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="address"
                                    rows={3}
                                    placeholder="Enter your complete home address..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className={cn(
                                        "rounded-xl text-xs font-medium bg-background/50 border-border/80 focus-visible:ring-primary resize-none shadow-xs",
                                        errors.address && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                                {errors.address && (
                                    <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                        <AlertCircle className="h-3.5 w-3.5" /> {errors.address}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Technical Skills */}
                    <Card className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-lg">
                        <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/5 via-muted/10 to-transparent p-6 rounded-t-3xl overflow-hidden">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-xs">
                                    <Cpu className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Tech Stack & Tools <span className="text-xs font-normal text-muted-foreground">(Optional)</span></CardTitle>
                                    <CardDescription className="text-xs">Select your technical proficiencies and skills.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8">
                            <TechnologySelector
                                selectedTechnologies={formData.skills}
                                onChange={(techs) => setFormData({ ...formData, skills: techs })}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* STEP 2: Bank Account & Payroll */}
            {activeStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                    <Card className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-lg overflow-hidden">
                        <CardHeader className="border-b border-border/40 bg-gradient-to-r from-emerald-500/10 via-muted/10 to-transparent p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-xs">
                                    <Landmark className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Direct Deposit Bank Account</CardTitle>
                                    <CardDescription className="text-xs">Essential for monthly salary transfers and payslip generation.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Account Holder Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="Full name as printed on bank statement"
                                    value={formData.bankDetails.accountHolderName}
                                    onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value } })}
                                    className={cn(
                                        "h-11 rounded-xl text-xs font-medium bg-background/50 border-border/80 focus-visible:ring-primary shadow-xs",
                                        errors.accountHolderName && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                                {errors.accountHolderName && (
                                    <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                        <AlertCircle className="h-3.5 w-3.5" /> {errors.accountHolderName}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Account Number <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="Enter bank account number"
                                    value={formData.bankDetails.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                                    className={cn(
                                        "h-11 rounded-xl text-xs font-medium bg-background/50 border-border/80 focus-visible:ring-primary shadow-xs",
                                        errors.accountNumber && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                                {errors.accountNumber && (
                                    <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                        <AlertCircle className="h-3.5 w-3.5" /> {errors.accountNumber}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Bank Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="e.g. HDFC Bank, ICICI Bank"
                                    value={formData.bankDetails.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                                    className={cn(
                                        "h-11 rounded-xl text-xs font-medium bg-background/50 border-border/80 focus-visible:ring-primary shadow-xs",
                                        errors.bankName && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                                {errors.bankName && (
                                    <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                        <AlertCircle className="h-3.5 w-3.5" /> {errors.bankName}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    IFSC Code <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="e.g. HDFC0001234"
                                    value={formData.bankDetails.ifscCode}
                                    onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() } })}
                                    className={cn(
                                        "h-11 rounded-xl text-xs font-medium bg-background/50 border-border/80 focus-visible:ring-primary uppercase shadow-xs",
                                        errors.ifscCode && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                                {errors.ifscCode && (
                                    <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                                        <AlertCircle className="h-3.5 w-3.5" /> {errors.ifscCode}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* STEP 3: Experience & Education */}
            {activeStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                    {/* Work Experience */}
                    <Card className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-lg overflow-hidden">
                        <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/5 via-muted/10 to-transparent p-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Past Work Experience</CardTitle>
                                    <CardDescription className="text-xs">Add previous positions and employment records.</CardDescription>
                                </div>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('experience')} className="h-9 text-xs font-semibold rounded-xl gap-1.5 shadow-xs">
                                <Plus className="h-4 w-4" /> Add Experience
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            {formData.experience.map((exp: any, index: number) => (
                                <div key={index} className="space-y-5 p-6 rounded-2xl border-l-4 border-l-primary border border-border/60 bg-muted/20 relative shadow-sm">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg" onClick={() => handleRemoveItem('experience', index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Company Name <span className="text-destructive">*</span></Label>
                                            <Input
                                                value={exp.company || ""}
                                                onChange={(e) => handleChange('experience', index, 'company', e.target.value)}
                                                placeholder="e.g. Google"
                                                className={cn("h-10 rounded-xl text-xs bg-background/50", errors[`experience_${index}_company`] && "border-destructive")}
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
                                                className={cn("h-10 rounded-xl text-xs bg-background/50", errors[`experience_${index}_role`] && "border-destructive")}
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
                                                className="flex h-10 w-full rounded-xl border border-muted-foreground/30 bg-background/50 px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                                                className="h-10 rounded-xl text-xs bg-background/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Tools & Technologies Used</Label>
                                        <TechnologySelector
                                            selectedTechnologies={exp.technologies || []}
                                            onChange={(techs) => handleChange('experience', index, 'technologies', techs)}
                                        />
                                    </div>
                                </div>
                            ))}
                            {formData.experience.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-2xl border-border/60 bg-muted/10 text-xs">
                                    No work experience added. Click &quot;Add Experience&quot; above to include your employment history.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Education */}
                    <Card className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-lg overflow-hidden">
                        <CardHeader className="border-b border-border/40 bg-gradient-to-r from-indigo-500/10 via-muted/10 to-transparent p-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-xs">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Academic Education</CardTitle>
                                    <CardDescription className="text-xs">Degrees, diplomas, and institutions attended.</CardDescription>
                                </div>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('education')} className="h-9 text-xs font-semibold rounded-xl gap-1.5 shadow-xs">
                                <Plus className="h-4 w-4" /> Add Education
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            {formData.education.map((edu: any, index: number) => (
                                <div key={index} className="space-y-5 p-6 rounded-2xl border-l-4 border-l-indigo-500 border border-border/60 bg-muted/20 relative shadow-sm">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg" onClick={() => handleRemoveItem('education', index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Institution / University <span className="text-destructive">*</span></Label>
                                            <Input
                                                value={edu.institution || ""}
                                                onChange={(e) => handleChange('education', index, 'institution', e.target.value)}
                                                placeholder="e.g. Stanford University"
                                                className={cn("h-10 rounded-xl text-xs bg-background/50", errors[`education_${index}_institution`] && "border-destructive")}
                                            />
                                            {errors[`education_${index}_institution`] && (
                                                <p className="text-xs text-destructive font-medium">{errors[`education_${index}_institution`]}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Degree / Field of Study <span className="text-destructive">*</span></Label>
                                            <Input
                                                value={edu.degree || ""}
                                                onChange={(e) => handleChange('education', index, 'degree', e.target.value)}
                                                placeholder="e.g. B.S. in Computer Science"
                                                className={cn("h-10 rounded-xl text-xs bg-background/50", errors[`education_${index}_degree`] && "border-destructive")}
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
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-2xl border-border/60 bg-muted/10 text-xs">
                                    No education records added yet. Click &quot;Add Education&quot; above to include your qualifications.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* STEP 4: Verification Documents & Certifications */}
            {activeStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                    {/* Verification Documents */}
                    <Card className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-lg overflow-hidden">
                        <CardHeader className="border-b border-border/40 bg-gradient-to-r from-emerald-500/10 via-muted/10 to-transparent p-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-xs">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Verification Documents</CardTitle>
                                    <CardDescription className="text-xs">Upload mandatory government ID proof, resume, or certificates.</CardDescription>
                                </div>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem('documents')} className="h-9 text-xs font-semibold rounded-xl gap-1.5 shadow-xs">
                                <Plus className="h-4 w-4" /> Add Document
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            {formData.documents.map((doc: any, index: number) => (
                                <div key={index} className="space-y-5 p-6 rounded-2xl border border-border/80 bg-muted/20 relative shadow-sm">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg" onClick={() => handleRemoveItem('documents', index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Document Type <span className="text-destructive">*</span></Label>
                                            <select
                                                className="flex h-10 w-full rounded-xl border border-muted-foreground/30 bg-background/50 px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                                            <Label className="text-xs font-semibold">Document Name / Title <span className="text-destructive">*</span></Label>
                                            <Input
                                                placeholder="e.g. Aadhaar Card, Passport PDF"
                                                value={doc.name || ""}
                                                onChange={(e) => handleChange('documents', index, 'name', e.target.value)}
                                                className={cn("h-10 rounded-xl text-xs bg-background/50", errors[`documents_${index}_name`] && "border-destructive")}
                                            />
                                            {errors[`documents_${index}_name`] && (
                                                <p className="text-xs text-destructive font-medium mt-1">{errors[`documents_${index}_name`]}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upload Drag/Select Card */}
                                    <div className="p-4 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 space-y-3">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                                    <UploadCloud className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">Upload Document File or Provide Link</p>
                                                    <p className="text-[10px] text-muted-foreground">Supports PDF, JPG, PNG files</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    disabled={uploading[index] || !!doc.url}
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(index, e.target.files[0])}
                                                    className="h-9 text-xs max-w-[220px]"
                                                />
                                            </div>
                                        </div>

                                        {uploading[index] && <p className="text-xs text-primary font-medium animate-pulse">Uploading file securely...</p>}
                                        {doc.url && (
                                            <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-4 w-4" /> Document File Attached
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPreviewDoc({ url: doc.url, name: doc.name || `Document ${index + 1}` })}
                                                    className="h-7 text-xs font-medium rounded-lg"
                                                >
                                                    <ExternalLink className="h-3 w-3 mr-1" /> Preview File
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {errors[`documents_${index}_url`] && (
                                        <p className="text-xs text-destructive font-medium mt-1">{errors[`documents_${index}_url`]}</p>
                                    )}
                                </div>
                            ))}
                            {formData.documents.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-2xl border-border/60 bg-muted/10 text-xs">
                                    No verification documents added yet. Click &quot;Add Document&quot; above to attach ID proof or Resume.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Certifications */}
                    <Card className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-lg overflow-hidden">
                        <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/5 via-muted/10 to-transparent p-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Certifications & Licenses <span className="text-xs font-normal text-muted-foreground">(Optional)</span></CardTitle>
                                    <CardDescription className="text-xs">Add professional credentials or course certificates.</CardDescription>
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
                                className="h-9 text-xs font-semibold rounded-xl gap-1.5 shadow-xs"
                            >
                                <Plus className="h-4 w-4" /> Add Certification
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            {formData.certifications.map((cert: any, index: number) => (
                                <div key={index} className="space-y-4 p-6 rounded-2xl border border-border/80 bg-muted/20 relative shadow-sm">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg"
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
                                                className={cn("h-10 rounded-xl text-xs bg-background/50", errors[`certifications_${index}_name`] && "border-destructive")}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Issuing Organization <span className="text-destructive">*</span></Label>
                                            <Input
                                                placeholder="e.g. Amazon Web Services"
                                                value={cert.issuer}
                                                onChange={(e) => handleChange('certifications', index, 'issuer', e.target.value)}
                                                className={cn("h-10 rounded-xl text-xs bg-background/50", errors[`certifications_${index}_issuer`] && "border-destructive")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formData.certifications.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-2xl border-border/60 bg-muted/10 text-xs">
                                    No certifications added. Click &quot;Add Certification&quot; if applicable.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Navigation Controls Bar */}
            <div className="sticky bottom-4 z-20 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={activeStep === 0}
                    className="h-10 text-xs font-semibold rounded-xl px-5 border-border/80 hover:bg-muted/60"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>

                <div className="flex items-center gap-3">
                    {activeStep < STEPS.length - 1 ? (
                        <Button
                            key={`next-step-btn-${activeStep}`}
                            type="button"
                            onClick={handleNextStep}
                            className="h-10 text-xs font-semibold rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                        >
                            Next Step <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            key="submit-profile-btn-final"
                            type="submit"
                            disabled={loading}
                            className="h-10 text-xs font-semibold rounded-xl px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                        >
                            {loading ? "Submitting..." : submitLabel}
                        </Button>
                    )}
                </div>
            </div>

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
