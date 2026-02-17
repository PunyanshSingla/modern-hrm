"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    User, 
    CreditCard, 
    Briefcase,
    Save,
    Plus,
    Trash2,
    X,
    ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState<any>({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        bankDetails: {
            bankName: "",
            accountNumber: "",
            ifscCode: "",
            accountHolderName: ""
        },
        skills: []
    });

    const [newSkill, setNewSkill] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/employee/profile");
                const data = await res.json();
                if (data.success) {
                    const p = data.profile;
                    setFormData({
                        firstName: p.firstName || "",
                        lastName: p.lastName || "",
                        phone: p.phone || "",
                        address: p.address || "",
                        bankDetails: {
                            bankName: p.bankDetails?.bankName || "",
                            accountNumber: p.bankDetails?.accountNumber || "",
                            ifscCode: p.bankDetails?.ifscCode || "",
                            accountHolderName: p.bankDetails?.accountHolderName || ""
                        },
                        skills: p.skills || []
                    });
                }
            } catch (error) {
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        if (id.includes('.')) {
            const [parent, child] = id.split('.');
            setFormData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData((prev: any) => ({ ...prev, [id]: value }));
        }
    };

    const addSkill = () => {
        if (!newSkill.trim()) return;
        if (formData.skills.includes(newSkill.trim())) return;
        setFormData((prev: any) => ({
            ...prev,
            skills: [...prev.skills, newSkill.trim()]
        }));
        setNewSkill("");
    };

    const removeSkill = (skill: string) => {
        setFormData((prev: any) => ({
            ...prev,
            skills: prev.skills.filter((s: string) => s !== skill)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/employee/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Profile updated successfully");
                router.push("/employee/profile");
            } else {
                toast.error(data.error || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground hover:text-primary">
                        <Link href="/employee/profile">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-black tracking-tight uppercase">Edit <span className="text-primary italic">Profile</span></h1>
                </div>
                <Button onClick={handleSubmit} disabled={submitting} className="rounded-2xl h-12 px-8 font-black uppercase tracking-tight shadow-lg shadow-primary/20">
                    <Save className="mr-2 h-5 w-5" /> {submitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
                {/* Personal Section */}
                <Card className="rounded-[40px] border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden border-t-8 border-t-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-bold italic uppercase tracking-tight">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <User className="h-5 w-5" />
                            </div>
                            Personal Identity
                        </CardTitle>
                        <CardDescription>Update your basic contact information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
                                <Input id="firstName" value={formData.firstName} onChange={handleChange} className="rounded-xl border-2 focus:border-primary transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
                                <Input id="lastName" value={formData.lastName} onChange={handleChange} className="rounded-xl border-2 focus:border-primary transition-all font-bold" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} className="rounded-xl border-2 focus:border-primary transition-all font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Residential Address</Label>
                            <Textarea id="address" value={formData.address} onChange={handleChange} className="rounded-xl border-2 focus:border-primary transition-all min-h-[100px] resize-none font-medium" />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    {/* Financial Section */}
                    <Card className="rounded-[40px] border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl font-bold italic uppercase tracking-tight text-emerald-500">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                Bank Accounts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bankDetails.bankName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bank Name</Label>
                                    <Input id="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} placeholder="e.g. Chase Bank" className="rounded-xl border-2 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankDetails.ifscCode" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Routing / IFSC</Label>
                                    <Input id="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} className="rounded-xl border-2 font-bold uppercase" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankDetails.accountNumber" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Number</Label>
                                <Input id="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} className="rounded-xl border-2 font-mono font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankDetails.accountHolderName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Holder Name</Label>
                                <Input id="bankDetails.accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleChange} className="rounded-xl border-2 font-bold" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills Section */}
                    <Card className="rounded-[40px] border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl font-bold italic uppercase tracking-tight text-amber-500">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                Skill Inventory
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-2">
                                <Input 
                                    value={newSkill} 
                                    onChange={(e) => setNewSkill(e.target.value)} 
                                    placeholder="Add a skill (e.g. React, Python)" 
                                    className="rounded-xl border-2 font-bold" 
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                />
                                <Button type="button" onClick={addSkill} size="icon" className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600">
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {formData.skills.map((skill: string) => (
                                    <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1.5 rounded-xl font-black uppercase tracking-tighter bg-amber-500 text-white flex items-center gap-2 group transition-all hover:scale-105">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)} className="p-1 hover:bg-white/20 rounded-md transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {formData.skills.length === 0 && <p className="text-xs italic text-muted-foreground font-medium">No skills added yet.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
